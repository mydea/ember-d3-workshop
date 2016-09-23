import Ember from 'ember';
import d3 from 'd3';
import $ from 'jquery';

export default Ember.Component.extend({

  data: [
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
  ],

  // -----------------------------------------------------------------------
  // METHODS
  // -----------------------------------------------------------------------

  addSVG: function() {
    var el = this.$().get(0); // Get the actual DOM node, not the jQuery element
    var height = 400;
    var width = el.offsetWidth;

    var svg = d3.select(el).append('svg')
      .attr('class', `chart`)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid');

    this.set('chartSVG', svg);
  },

  drawData: function() {
    // TODO: Draw the data
  },

  createChart: function() {
    // Clear the element, if there is something inside
    var chartEl = this.$().get(0);
    chartEl.innerHTML = '';

    // Actually create the SVG element
    this.addSVG();

    // Draw the data
    this.drawData();
  },

  // -----------------------------------------------------------------------
  // LIFECYCLE HOOKS
  // These are special functions that are called by ember at different stages
  // of the component's lifecycle.
  // -----------------------------------------------------------------------

  didInsertElement: function() {
    this.createChart();
  }

});
