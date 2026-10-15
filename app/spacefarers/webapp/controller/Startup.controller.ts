import Controller from "sap/ui/core/mvc/Controller";
import Component from "sap/ui/core/Component";
import ComponentContainer from "sap/ui/core/ComponentContainer";
import UIComponent from "sap/ui/core/UIComponent";
import HashChanger from "sap/ui/core/routing/HashChanger";
import MessageToast from "sap/m/MessageToast";
import JSONModel from "sap/ui/model/json/JSONModel";

type Planet = { ID: string; name: string };
type Assignment = { planet_ID: string | null };

const service = "/odata/v4/spacefarer/";

/** @namespace galactic.spacefarers.controller */
export default class Startup extends Controller {
  private model = new JSONModel({
    busy: true,
    ready: false,
    canGoBack: false,
    selectedPlanet: "",
    planetName: "",
    planets: [],
    error: "",
  });

  private hashChanger = HashChanger.getInstance();

  onInit(): void {
    this.getView()!.setModel(this.model, "startup");
    this.hashChanger.attachEvent("hashChanged", this.updateBackButton, this);
    this.updateBackButton();
    void this.loadMembership();
  }

  onExit(): void {
    this.hashChanger.detachEvent("hashChanged", this.updateBackButton, this);
    this.model.destroy();
  }

  onBack(): void {
    this.hashChanger.setHash("");
  }

  private updateBackButton(): void {
    this.model.setProperty(
      "/canGoBack",
      /^\/?Spacefarers\(/.test(this.hashChanger.getHash()),
    );
  }

  onRetry(): void {
    void this.loadMembership();
  }

  async onChoosePlanet(): Promise<void> {
    this.model.setProperty("/busy", true);
    this.model.setProperty("/error", "");

    try {
      await this.request<Assignment>("choosePlanet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planet_ID: this.model.getProperty("/selectedPlanet"),
        }),
      });

      await this.loadMembership();
    } catch (error) {
      // Another tab may have saved a different choice while this screen was open.
      const current = await this.request<Assignment>("getMyPlanet()").catch(
        () => null,
      );

      if (current?.planet_ID) {
        MessageToast.show(
          "Your planet was already selected. Loading your saved choice.",
        );

        await this.loadMembership();
      } else {
        this.showError(error);
      }
    } finally {
      this.model.setProperty("/busy", false);
    }
  }

  private async loadMembership(): Promise<void> {
    this.model.setProperty("/busy", true);
    this.model.setProperty("/error", "");

    try {
      const assignment = await this.request<Assignment>("getMyPlanet()");
      const planets = await this.request<{ value: Planet[] }>(
        "Planets?$select=ID,name&$orderby=name",
      );
      this.model.setProperty("/planets", planets.value);

      if (assignment.planet_ID) {
        const planet = planets.value.find(
          (item) => item.ID === assignment.planet_ID,
        );

        this.model.setProperty("/planetName", planet?.name ?? "Your planet");

        const container = this.byId("fiori") as ComponentContainer;

        if (!container.getComponent()) {
          const component = await Component.create({
            name: "galactic.spacefarers.fe",
            id: "spacefarers",
            manifest: true,
          });

          container.setComponent(component as UIComponent);
        }

        this.model.setProperty("/ready", true);
      }
    } catch (error) {
      this.showError(error);
    } finally {
      this.model.setProperty("/busy", false);
    }
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(service + path, {
      credentials: "same-origin",
      ...options,
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.error?.message ??
          "Could not reach the service. Check that the backend is running.",
      );
    }

    if (!data) {
      throw new Error(
        "The service returned an unexpected response. Please try again.",
      );
    }

    return data as T;
  }

  private showError(error: unknown): void {
    this.model.setProperty(
      "/error",
      error instanceof Error
        ? error.message
        : "Could not load the application. Please try again.",
    );
  }
}
