import UIComponent from "sap/ui/core/UIComponent";

/** @namespace galactic.spacefarers */
export default class Component extends UIComponent {
  static metadata = {
    manifest: "json",
    interfaces: ["sap.ui.core.IAsyncContentCreation"],
  };
}
