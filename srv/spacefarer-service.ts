import cds from "@sap/cds";
import type { Request, Service } from "@sap/cds";

const { SELECT } = cds.ql;

type SpacefarerAssignment = {
  department_ID?: string;
  position_ID?: string;
};

export default cds.service.impl(function (this: Service) {
  const { Spacefarers, Positions } = this.entities;

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

    if (position && position.department_ID !== departmentID) {
      req.reject(
        400,
        "The selected position must belong to the selected department.",
      );
    }
  });
});
