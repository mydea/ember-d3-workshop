import Ember from 'ember';

export default Ember.Route.extend({

  model: function() {
    return [
      {
        name: 'John',
        value: 31
      },
      {
        name: 'Anne',
        value: 33
      },
      {
        name: 'Robert',
        value: 28
      }
    ];
  }

});
