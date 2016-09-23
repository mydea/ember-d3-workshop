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
    var data = this.get('data');
    var x = this.get('xScale');
    var y = this.get('yScale');

    var svg = this.get('chartSVG');

    var line = d3.line()
      .x(function(d, i) {
        return x(i);
      })
      .y(function(d) {
        return y(d);
      });

    var lines = svg
      .selectAll('.line-chart__line__container')
      .data(data);

    // Append the new ones
    lines.enter()
      .append('g')
      .attr('class', 'line-chart__line__container')
      .append('svg:path')
      .attr('class', 'line-chart__line')
      .style('stroke', function(d) {
        return d.color;
      })
      .attr('d', (d) => line(d.values))
      .attr('fill', 'none');
  }

});
