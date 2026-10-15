using { galactic as db } from '../db/schema';

@requires: 'authenticated-user'
service SpacefarerService {
  @odata.draft.enabled
  @restrict: [{ grant: '*', to: 'planet-member', where: 'planet_ID = $user.planet' }]
  entity Spacefarers as projection on db.Spacefarers;
  @readonly
  entity Departments as projection on db.Departments;
  @readonly
  entity Positions as projection on db.Positions;
  @readonly
  entity Planets as projection on db.Planets;

  type PlanetAssignment { planet_ID : UUID; }
  function getMyPlanet() returns PlanetAssignment;
  action choosePlanet(planet_ID: UUID not null) returns PlanetAssignment;
}
