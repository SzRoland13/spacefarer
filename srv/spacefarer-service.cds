using { galactic as db } from '../db/schema';

service SpacefarerService {
  entity Spacefarers as projection on db.Spacefarers;
  entity Departments as projection on db.Departments;
  entity Positions as projection on db.Positions;
  entity Planets as projection on db.Planets;
}
