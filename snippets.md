# Code Snippets

Here, you can find some general snippets for things that can come up when
working with D3.

## Auto-Resize

We need to listen to the resize event, and re-draw the chart. 
A simple implementation for this could be:

```js
updateChartSize() {
  this.notifyPropertyChange('chartWidth');
  this.createChart();
},

addResizeListener() {
  var _this = this;

  // Debounce the handler
  // This prevents the chart from being re-rendert all the time
  var _resizeHandler = function() {
    Ember.run.debounce(_this, _this.updateChartSize, 200);
  };

  $(window).on(`resize.${this.get('elementId')}`, _resizeHandler);
},

removeResizeListener() {
  $(window).off(`resize.${this.get('elementId')}`);
}
```


The crucial part here is the `this.notifyPropertyChange('chartWidth')` part.
Since computed properties are cached by Ember, we need to tell it when it should be recomputed.
Otherwise, the chart would stay the same size after redrawing it.

Then, we'll attach/remove the listener through Ember's lifecycle hooks:

```js
didInsertElement: function() {
  this.createChart();

  // Add a resize listener
  this.addResizeListener();
},

willDestroyElement() {
  this.removeResizeListener();
}
```

## Update data

This can be done in varying degrees of complexity.
The easiest way would be to just re-draw the complete graph.

In Ember, this could easily be done via the `didReiceiveAttrs` lifecycle hook:

```js 
didReceiveAttrs: function() {
  if(this.get('chartSVG') {
    this.createChart();
  }
}
```

Note that the check for `chartSVG` is necessary because this lifecycle hook
is also called when the initial data is passed in. We only want to re-render
if the data changes at a later point.

Now, whenever new data is passed in, the chart will be re-drawn.
However, you will also need to update the scales, because they depend
on the data.

You could do this manually:

```js
didReceiveAttrs: function() {
  if(this.get('chartSVG') {
    this.notifyPropertyChange('xScale');
    this.notifyPropertyChange('yScale');
    this.createChart();
  }
}
```

Or you could take advantage of Ember's computed properties, which can
observe other properties for changes and recompute automatically:

```js
xScale: Ember.computed('data', function() {
  // ...
}),

yScale: Ember.computed('data', function() {
  // ...
})
```

Now, every time new data is passed in, the scales will automatically be re-computed.

### Actually updating the data

The approaches mentioned above are quite simple in their implementation.
However, in an ideal world, we wouldn't want to tear down the whole
chart whenever the data changes, but just update the drawn data on it.

D3 can handle these things quite well.

First, items that are removed from the data need to be removed from the DOM:

```js
drawData: function() {
  // ...
  
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
    
    // Old ones are removed
    bars.exit().removed();
}
```

Additionally, the ones that stay in there but have their data changed should just be updated:

```js
drawData: function() {
  // ...
  
  bars.attr('x', function(d) {
       return x(d.name) + x.bandwidth() / 3;
     })
     .attr('width', x.bandwidth() / 3)
     .attr('y', function(d) {
       return y(d.value);
     })
     .attr('height', function(d) {
       return height - y(d.value);
     });
}
```

But how does D3 know if an items is added, removed or changed? 
It uses the second argument of the data function for this:

```js
var bars = svg
  .selectAll('.bar-chart__bar')
  .data(data, function(d) {
    return d.name; // If the return value here is the same, it will update
  });
```

## Hover Tooltips

Another common usecase is to show a tooltip on hover.
This can be achieved with D3's `mouseover` and `mouseout` events.

```js
drawData: function() {
  // ...
  this.addHoverTooltip(bars);
},

addHoverTooltips(elements) {
  var chartSVG = this.get('chartSVG');
  var tooltipElement = chartSVG.append('div')
    .attr('class', 'chart__tooltip')
    .style('opacity', 0);
    
    var svgPosLeft = this.$().offset().left;
    var svgPosTop = this.$().offset().top;
    
    elements.on('mouseover', function(d) {
      var posLeft = d3.event.pageX - svgPosLeft;
      var posTop = d3.event.pageY - svgPosTop;
                  
      tooltipElement
        .style('left', `${posLeft + 10}px`)
        .style('top', `${posTop - 28}px`)
        .html(d.name + ': ' + d.value)
        .transition()
        .duration(200)
        .style('opacity', 0.9);
    });
    
    elements.on('mouseout', function() {
      tooltipElement
        .transition()
        .duration(500)
        .style('opacity', 0);
    });
}
```


