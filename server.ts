import cds from "@sap/cds";
import type { RequestHandler } from "express";

type PlanetAssignment = { planet_ID: string };

// CAP runs generic authorization before service before-handlers. Enrich the
// request identity here so @restrict sees the persisted membership.
cds.on("bootstrap", () => {
  const planetMembership: RequestHandler = async (req, res, next) => {
    try {
      const context = cds.context;

      if (!context) {
        return next();
      }

      const user = context.user;

      if (user.is("authenticated-user")) {
        const assignment: PlanetAssignment | undefined = await cds.db.run(
          cds.ql.SELECT.one
            .from("galactic.UserPlanets")
            .where({ userId: user.id }),
        );

        const configuredRoles = Array.isArray(user.roles)
          ? user.roles
          : Object.keys(user.roles);

        const roles = configuredRoles.filter(
          (role) => role !== "planet-member",
        );

        const attr = { ...user.attr };

        delete attr.planet;

        if (assignment?.planet_ID) {
          roles.push("planet-member");
          attr.planet = assignment.planet_ID;
        }

        context.user = new cds.User({
          ...user,
          roles,
          attr,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  cds.middlewares.add(planetMembership, { after: "auth" });
});

export default cds.server;
