using { SpacefarerService } from '../srv/spacefarer-service';

annotate SpacefarerService.Spacefarers with @(
  UI.HeaderInfo: {
    TypeName: 'Spacefarer',
    TypeNamePlural: 'Spacefarers',
    Title: { Value: firstName },
    Description: { Value: lastName }
  },
  UI.LineItem: [
    { Value: firstName },
    { Value: lastName },
    { Value: stardustCollection },
    { Value: wormholeNavigationSkill },
    { Value: spacesuitColor }
  ],
  UI.SelectionFields: [ firstName, lastName, spacesuitColor, department_ID ],
  UI.Facets: [
    { $Type: 'UI.ReferenceFacet', Label: 'Personal details', Target: '@UI.FieldGroup#Personal' },
    { $Type: 'UI.ReferenceFacet', Label: 'Cosmic skills', Target: '@UI.FieldGroup#Skills' },
    { $Type: 'UI.ReferenceFacet', Label: 'Assignment', Target: '@UI.FieldGroup#Assignment' }
  ],
  UI.FieldGroup#Personal: {
    Data: [ { Value: firstName }, { Value: lastName }, { Value: email } ]
  },
  UI.FieldGroup#Skills: {
    Data: [
      { Value: stardustCollection },
      { Value: wormholeNavigationSkill },
      { Value: spacesuitColor }
    ]
  },
  UI.FieldGroup#Assignment: {
    Data: [ { Value: planet.name, Label: 'Planet' }, { Value: department_ID }, { Value: position_ID } ]
  }
);

annotate SpacefarerService.Spacefarers with {
  ID @UI.Hidden @Core.Computed;
  firstName @title: 'First name' @mandatory;
  lastName @title: 'Last name' @mandatory;
  email @title: 'Email' @mandatory;
  stardustCollection @title: 'Stardust collection';
  wormholeNavigationSkill @title: 'Wormhole navigation skill';
  spacesuitColor @title: 'Spacesuit color';
  planet @(
    title: 'Planet',
    Common.Text: planet.name,
    Common.Text.@UI.TextArrangement: #TextOnly
  );
  department @(
    title: 'Department',
    mandatory,
    Common.Text: department.name,
    Common.Text.@UI.TextArrangement: #TextOnly,
    Common.ValueListWithFixedValues: true,
    Common.ValueList: {
      CollectionPath: 'Departments',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: department_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
      ]
    }
  );
  position @(
    title: 'Position',
    mandatory,
    Common.Text: position.title,
    Common.Text.@UI.TextArrangement: #TextOnly,
    Common.ValueListWithFixedValues: true,
    Common.ValueList: {
      CollectionPath: 'Positions',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: position_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterIn', LocalDataProperty: department_ID, ValueListProperty: 'department_ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'title' }
      ]
    }
  );
};

annotate SpacefarerService.Departments with {
  ID @UI.Hidden @Common.Text: name;
  name @title: 'Department';
};

annotate SpacefarerService.Positions with {
  ID @UI.Hidden @Common.Text: title;
  title @title: 'Position';
  department_ID @UI.Hidden;
};
