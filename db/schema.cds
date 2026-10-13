namespace galactic;

using { cuid, managed } from '@sap/cds/common';

entity Planets : cuid, managed {
  name        : String(100) not null;
  description : String(500);
}

entity Departments : cuid, managed {
  name        : String(100) not null;
  description : String(500);
}

entity Positions : cuid, managed {
  title       : String(100) not null;
  description : String(500);
  department  : Association to Departments not null;
}

entity Spacefarers : cuid, managed {
  firstName                : String(100) not null;
  lastName                 : String(100) not null;
  email                    : String(254) not null;
  stardustCollection       : Integer default 0 @assert.range: [0, 2147483647];
  wormholeNavigationSkill  : Integer default 1 @assert.range: [1, 100];
  spacesuitColor           : String(40);
  planet                   : Association to Planets not null;
  department               : Association to Departments not null;
  position                 : Association to Positions not null;
}
