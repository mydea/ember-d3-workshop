import Ember from 'ember';

export default Ember.Route.extend({

  model: function() {

    var barChartData = [
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

    var lineChartData = [
      {
        name: 'John',
        values: [7512, 8093, 14731, 10082],
        color: 'red'
      },
      {
        name: 'Anne',
        values: [9923, 9789, 8309, 10810],
        color: 'green'
      },
      {
        name: 'Robert',
        values: [6039, 7093, 4020, 9501],
        color: 'blue'
      }
    ];

    return {
      barChart: barChartData,
      lineChart: lineChartData
    };
  }

});
