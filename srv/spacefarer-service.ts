import cds from "@sap/cds";
import type { Request } from "@sap/cds";

const { SELECT, INSERT } = cds.ql;

type SpacefarerAssignment = {
  department_ID?: string;
  position_ID?: string;
};

export default class SpacefarerService extends cds.ApplicationService {
  init() {
    const { Spacefarers, Positions } = this.entities;

    this.before("READ", "*", async (req: Request) => {
      const path = req.subject?.ref;

      if (!path || path.length < 2) {
        return;
      }

      const parent = path[0];
      const parentName = typeof parent === "string" ? parent : parent.id;

      if (parentName !== Spacefarers.name) {
        return;
      }

      // Navigation is authorized against its final target (e.g. Planets).
      // Check the spacefarer first, while leaving direct lookup reads available.
      const planetID = req.user.attr.planet;

      if (!planetID) {
        return req.reject(
          403,
          "Choose your planet before accessing spacefarers.",
        );
      }

      const spacefarer = await cds.tx(req).run(
        SELECT.one
          .from({ ref: [parent] })
          .columns("ID")
          .where({ planet_ID: planetID }),
      );

      if (!spacefarer) {
        return req.reject(404, "Not Found");
      }
    });

    this.on("getMyPlanet", async (req: Request) => {
      const assignment = await cds
        .tx(req)
        .run(
          SELECT.one
            .from("galactic.UserPlanets")
            .where({ userId: req.user.id }),
        );

      return { planet_ID: assignment?.planet_ID ?? null };
    });

    this.on("choosePlanet", async (req: Request) => {
      const planetID = req.data.planet_ID;

      if (
        typeof planetID !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          planetID,
        )
      ) {
        return req.reject(400, "Choose a valid planet UUID.");
      }

      const tx = cds.tx(req);
      const planet = await tx.run(
        SELECT.one.from("galactic.Planets").where({ ID: planetID }),
      );

      if (!planet) {
        return req.reject(404, "The selected planet does not exist.");
      }

      const existing = await tx.run(
        SELECT.one.from("galactic.UserPlanets").where({ userId: req.user.id }),
      );

      if (existing) {
        if (existing.planet_ID !== planetID) {
          return req.reject(409, "Your planet choice cannot be changed.");
        }

        return { planet_ID: existing.planet_ID };
      }

      try {
        await tx.run(
          INSERT.into("galactic.UserPlanets").entries({
            userId: req.user.id,
            planet_ID: planetID,
          }),
        );
      } catch (error) {
        // A concurrent selection may have won the unique userId constraint.
        const winner = await tx.run(
          SELECT.one
            .from("galactic.UserPlanets")
            .where({ userId: req.user.id }),
        );

        if (!winner) {
          throw error;
        }

        if (winner.planet_ID !== planetID) {
          return req.reject(409, "Your planet choice cannot be changed.");
        }
      }

      return { planet_ID: planetID };
    });

    this.before(["CREATE", "UPDATE"], Spacefarers, (req: Request) => {
      if (
        ["planet", "department", "position"].some((field) =>
          Object.hasOwn(req.data, field),
        )
      ) {
        return req.reject(
          400,
          "Assign lookups using their _ID fields; nested lookup writes are not supported.",
        );
      }

      if (req.event === "CREATE" && !Object.hasOwn(req.data, "planet_ID")) {
        return req.reject(400, "The chosen planet_ID is required.");
      }

      if (
        Object.hasOwn(req.data, "planet_ID") &&
        req.data.planet_ID !== req.user.attr.planet
      ) {
        return req.reject(
          403,
          "Spacefarers must belong to your chosen planet.",
        );
      }
    });

    this.before(["CREATE", "UPDATE"], Spacefarers, async (req: Request) => {
      const data = req.data as SpacefarerAssignment & { ID?: string };
      let current: SpacefarerAssignment = {};

      if (req.event === "UPDATE") {
        const id = data.ID ?? req.params?.[0]?.ID;
        if (id) {
          current =
            (await cds
              .tx(req)
              .run(
                SELECT.one
                  .from(Spacefarers)
                  .columns("department_ID", "position_ID")
                  .where({ ID: id }),
              )) ?? {};
        }
      }

      const departmentID = data.department_ID ?? current.department_ID;
      const positionID = data.position_ID ?? current.position_ID;

      if (!departmentID || !positionID) {
        return;
      }

      const position = await cds
        .tx(req)
        .run(
          SELECT.one
            .from(Positions)
            .columns("department_ID")
            .where({ ID: positionID }),
        );

      if (!position) {
        return req.reject(400, "The selected position does not exist.");
      }

      if (position.department_ID !== departmentID) {
        req.reject(
          400,
          "The selected position must belong to the selected department.",
        );
      }
    });

    return super.init();
  }
}
