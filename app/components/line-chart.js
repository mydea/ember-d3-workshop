import Ember from 'ember';
import ChartMixin from './../mixins/chart';
import d3 from 'd3';

export default Ember.Component.extend(ChartMixin, {

  xScale: Ember.computed('data.[]', 'chartWidth', function() {
    var data = this.get('data');
    var width = this.get('chartWidth');

    var firstItem = data[0];
    var positions = firstItem.values.map(function(item, i) {
      return i;
    });

    var widthPiece = width / positions.length;
    var positionPoints = positions.map(function(position) {
      return widthPiece * position;
    });

    return d3.scaleOrdinal()
      .domain(positions)
      .range(positionPoints);
  }),

  yScale: Ember.computed('data.[]', 'chartHeight', function() {
    var data = this.get('data');
    var height = this.get('chartHeight');

    var values = [];
    data.forEach(function(d) {
      values.pushObjects(d.values);
    });
    var minMax = d3.extent(values);

    return d3.scaleLinear()
      .domain(minMax)
      .range([height, 0]);
  }),

  drawData: function() {
    // TODO: Implement drawData
  }

});
