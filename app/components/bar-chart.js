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

  chartHeight: 400,

  chartWidth: Ember.computed(function() {
    return this.$().width();
  }),

  xScale: Ember.computed(function() {
    var data = this.get('data');
    var width = this.get('chartWidth');

    return d3.scaleBand()
      .domain(data.mapBy('name'))
      .range([0, width])
      .paddingOuter(1)
      .paddingInner(0.3);
  }),

  yScale: Ember.computed(function() {
    var data = this.get('data');
    var height = this.get('chartHeight');

    var allValues = d3.extent(data, function(d) {
      return d.value;
    });

    return d3.scaleLinear()
      .domain(allValues)
      .range([height, 0]);
  }),

  // -----------------------------------------------------------------------
  // METHODS
  // -----------------------------------------------------------------------

  addSVG: function() {
    var el = this.$().get(0); // Get the actual DOM node, not the jQuery element
    var height = this.get('chartHeight') + 100;
    var width = this.get('chartWidth');

    var svg = d3.select(el).append('svg')
      .attr('class', `chart`)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid');

    this.set('chartSVG', svg);
  },

  createXAxisElement: function() {
    let svg = this.get('chartSVG');
    var scale = this.get('xScale');
    let height = this.get('chartHeight');

    var xAxis = d3.axisBottom(scale)
      .tickSizeInner(4)
      .tickSizeOuter(0);

    svg.insert('g', ':first-child')
      .attr('class', 'chart__axis chart__axis--x')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');
  },

  createYAxisElement: function() {
   // TODO: Add y axis
  },

  drawData: function() {
    var color = '#60a425';

    var data = this.get('data');
    var height = this.get('chartHeight');
    var svg = this.get('chartSVG');
    var x = this.get('xScale');
    var y = this.get('yScale');

    // Select all bars
    var bars = svg
      .selectAll('.bar-chart__bar')
      .data(data, function(d) {
        return d.name;
      });

    // The new ones are appended
    bars.enter()
      .append('rect')
      .attr('class', 'bar-chart__bar')
      .attr('x', function(d) {
        return x(d.name) + x.bandwidth() / 3;
      })
      .attr('width', x.bandwidth() / 3)
      .attr('y', function(d) {
        return y(d.value);
      })
      .attr('height', function(d) {
        return height - y(d.value);
      })
      .attr('fill', color);
  },

  createChart: function() {
    // Clear the element, if there is something inside
    var chartEl = this.$().get(0);
    chartEl.innerHTML = '';

    // Actually create the SVG element
    this.addSVG();

    // Create the axes
    this.createXAxisElement();
    this.createYAxisElement();

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
