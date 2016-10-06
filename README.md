# Ember D3 Workshop

This is a simple example of using D3 in an Ember app. 
The concepts used here are not really tied to Ember, and can certainly also be used in other contexts.
You can review the Commit History to see how this example came to be, step by step.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://ember-cli.com/)
* [PhantomJS](http://phantomjs.org/) - If you want to run tests in the console

## Project Setup

After installing ember-cli, create a new project:

* `ember new ember-d3-workshop`

Then, deinstall the welcome page & install ember-d3:

* `npm uninstall ember-welcome-page --save-dev`
* `ember install ember-d3`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details.
Helpful commands:

* `ember generate <objectType> <objectName>`
* `ember install <addonName>`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://ember-cli.com/)
* Development Browser Extensions
  * [Ember Inspector for Chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [Ember Inspector for Firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

## Bar Chart

First, we want to create the general application route. 
You can have multiple routes in an app, but for our example we will only use the base application route.

```
ember generate route application
```

Next, we create a bar-chart component:

```
ember generate component bar-chart
```

We can include this in the application template:

```hbs
<!-- app/templates/application.hbs -->

{{bar-chart}}
```

Right now, this will only be an empty `<div>`.

Now we setup the basic bar-chart component structure:

```js
// app/components/bar-chart.js

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

  addSVG: function() {
    // TODO: Generate the base SVG object
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
```

The imports on top are an ES6 feature, modules, that ember-cli allows us to use. 
Don't worry, all of these things are automatically transpiled into a JavaScript
version that browsers can actually work with.

Then, we add skeleton functions to the component, that we will later fill out. 
We also add some data that represents people and their ages.

### addSVG

First, we will implement the `addSVG` function:

```js
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
}
 ```
 
 In this function, we specify a desired height for our chart, 
 and compute the width based on the container element's width.
 
 We then create an SVG element with D3, set its height and width, 
 and append it to the container element. 
 `preserveAspectRatio` is set to ensure that the aspect ratio stays the same 
 when the size of the chart changes.
 
 We then save the svg element for later reference.
 
### drawData
 
 Next, we want to actually draw the data in the SVG.
 D3 uses a regular coordinate system, where X and Y values can be set in pixels.
 This means that we need to map values to a range of pixels. 
 D3 can handle all of these things. Still, it needs to know the height and width to map values to.
 We set the width in the addSVG function before, but we will need it more often
 in different functions. In order to reduce code duplciation, we can specify them as properties in the component:
 
 ```js
 chartHeight: 400,
 
 chartWidth: Ember.computed(function() {
   return this.$().width();
 }),
 ```

The `chartHeight` is a static property, that we can simply set. 
The `chartWidth` is a dynamic property that needs to be computed at runtime.
For this, Ember provides computed properties via `Ember.computed()`. 
The return value of the provided function will then be the value of the `chartWidth` 
property. And don't worry, it will only be computed once and then be cached.

Now we can access both of these properties via `this.get('propertyName')`. 
First, let's replace the occurrences in the `addSVG` function:

```js
var height = this.get('chartHeight');
var width = this.get('chartWidth');
```

Then, let's implement the `drawData` function:

```js
drawData: function() {
  var color = '#60a425';

  var data = this.get('data');
  var height = this.get('chartHeight');
  var width = this.get('chartWidth');
  var svg = this.get('chartSVG');

  var x = d3.scaleBand()
    .domain(data.mapBy('name'))
    .range([0, width])
    .paddingOuter(1)
    .paddingInner(0.3);
}
```

For the bar chart, we use a band scale for the x axis. 
This scale will take a range of values, and separate them into 'bands'.
This is well suited for bar charts, because every bar will get its own band
and all of them will be the same width. The scale should be mapped to a range
from 0 to the chart width, and we also specify some padding for the bands - 
otherwise, the bars would stick to each other. 
The domain that is mapped to the range is the data. We use ember's `Array.mapBy('propertyName')`
method here. This turns the data into an array like this: `['John', 'Anne', 'Robert']`. 

Now, when you call `x('John')` you get the corresponding x value for the range band
that D3 has calculated for you.

```js
// ...

var allValues = d3.extent(data, function(d) {
  return d.value;
});

var y = d3.scaleLinear()
  .domain(allValues)
  .range([height, 0]);
```

The y scale works similar. First, we need to know what the highest and lowest possible
values are. `d3.extend()` does that for us.
We than map that domain to a range from the chart height to 0. 
Note how this is inversed - we map the smallest value to chartHeight, and the highest value to 0. 
This is because the coordinate system that D3 uses has its origin in the upper
left corner. This means that we want the highest value to end at y=0, and the lowest value
to end at y=400.

Finally, we can actually draw the bars in the SVG:

```js
// ...

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
``` 

This probably looks a bit weird: We select the bars - but there is nothing to select yet?
D3 lets you select collection, even if they are empty, and add data to them.
This is very powerful if you want to update data - but that is a topic for later.

D3 works like this:

* Select a collection - even if it doesn't exist yet. Select what you want to have as a result.
* Add data via `.data(myData, mapFunction)`. The mapFunction is optional and only used to handle updating values.
* Call `.enter()` on the collection after specifiying the data. 
This will then run the commands specified after it on every item that has been added to the selection.

So for every new data point, we:

* Append a `rect` element to the SVG
* Give it a class so we can select it again later
* Set the x value
* Set the width
* Set the y value
* Set the height
* Set the color

Now, we should already see a bar chart! Note that there are no axes yet, and
that the lowest value doesn't appear because it is mapped to the chartHeight value.

### Add x-axis

Next, we want to add nice axes. Let's start with the x-axis.
The axes should use the same scales as the `drawData()` function.
So let's move the x- and y-scale definitions into computed properties first,
so they can be easily reused:

```js
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
})
```

We can now simplify the `drawData()` function: 

```js
// ... 
 
 var x = this.get('xScale');
 var y = this.get('yScale'); 
``` 

Next, we implement a function to draw the x axis:

```js
createXAxisElement: function() {
  let svg = this.get('chartSVG');
  var scale = this.get('xScale');
  var height = this.get('chartHeight');

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
}
```

This function takes the xScale, and creates an axis with D3's `d3.axisBottom`.
We then create an SVG group (`g`) and append it to the SVG. We move it to the very bottom of the chart,
and then append the actual axis to it with `.call(xAxis)`. 
Then, we select all text that has been generated by the axis automatically, and style it
to fit our needs.

Now, we need to actually call this function in `createChart()`:

```js
// ...

// Create the axes
this.createXAxisElement();
```

However, it turns our you can't really see anything - this is because the axis starts at the bottom of the SVG and then runs out of it, 
which is automatically hidden. So we need to increase the SVG size:

```js
addSVG: function() {
  // ... 
  var height = this.get('chartHeight') + 100;  
}
```

Now, the axis should be visible on the bottom.

### Improve positioning for axes

The 'fix' with adding 100 to the chart height kind of works, but is not really nice - 
now, the chart is bigger than the 400px we specified it to be. Also,
we will run in the same problem for the y-axis, which should be on the
left hand side of the chart. We would need to adapt all x-positioning accordingly.

Luckily, there is a better way to handle this. 
Our goal is to specify margins around our actual chart, where things 
like axes or potentially legends could be positioned without obstructing the data.
 
So let's first specify these margins as a property:

```js
chartMargins: {
  top: 20,
  right: 20,
  bottom: 60,
  left: 60
}
```

Now, we modify the `chartWidth` and `chartHeight` functions to take this into account:

```js
chartHeight: Ember.computed(function() {
  var height = 400;
  var margins = this.get('chartMargins');
  return height - margins.top - margins.bottom;
}),

chartWidth: Ember.computed(function() {
  var width = this.$().width();
  var margins = this.get('chartMargins');
  return width - margins.right - margins.left;
})
```

Then, we adapt the `addSVG` function:

```js
addSVG: function() {
  var el = this.$().get(0); // Get the actual DOM node, not the jQuery element
  var height = this.get('chartHeight');
  var width = this.get('chartWidth');
  var margins = this.get('chartMargins');

  var fullWidth = width + margins.left + margins.right;
  var fullHeight = height + margins.top + margins.bottom;

  // Even though this is the actual SVG element, we will always use the appended
  // g-Element. This is used to make working with margins easier
  var container = d3.select(el).append('svg')
    .attr('class', `chart`)
    .attr('width', fullWidth)
    .attr('height', fullHeight)
    .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
    .attr('preserveAspectRatio', 'xMidYMid');

  let svg = container.append('g')
    .attr('transform', `translate(${margins.left},${margins.top})`);

  this.set('chartContainer', container);
  this.set('chartSVG', svg);
}
```

First, we calculate the actual full width and height the chart should have.
We then create the SVG and set its dimensions to the full width & height.

Then, we append a group `g` to the SVG, which we move to the correct position.
We then save the `g` as `chartSVG` (and the container as `chartContainer`).
 
This means, that whenever we append something to `chartSVG`, it will
actually be appended to the inner container - which is positioned nicely.
We now have the specified margins as space for other things like axes.

### Add y-axis

Now, we can finally add the y axis.

```js
 createYAxisElement: function() {
  var svg = this.get('chartSVG');
  var scale = this.get('yScale');
  var ticks = 6;

  var minMax = scale.domain();
  var diff = minMax[1] - minMax[0];
  var steps = diff / (ticks - 1);

  var tickValues = [];
  for (var i = 0; i < ticks; i++) {
    tickValues.push(minMax[0] + steps * i);
  }

  var yAxis = d3.axisLeft(scale)
    .tickValues(tickValues)
    .tickFormat(d3.format('.0f'))
    .tickSizeInner(6)
    .tickSizeOuter(6);

  svg.insert('g', ':first-child')
    .attr('class', 'chart__axis chart__axis--y')
    .call(yAxis);
}
```

Most of this should look pretty familiar by now. 
We calculate the tick values manually (you can also let D3 do this for you,
but this sometimes does weird things for small data sets).

Now, we only need to add `this.createYAxisElement();` to the `createChart()` function,
and voila!

### Feed data into the chart

Currently, we hard-coded the data into the component. This is obviously not ideal - 
we want to be able to pass in whatever data we want!

First, let's remove the default data from the component:

```js
data: []
```

In Ember, data is handled by routes. A route has a `model()` function
that can return data. This can either be static data, or an Ajax request.
If you pass in an ajax request, Ember will automaticalaly wait until the
request has resolved and feed the returned data into the the application.

While we will be using static data for the sake of simplicity, this is what
this would look like for remote data:

```js
// app/routes/application.js
import Ember from 'ember';
import $ from 'jquery';

export default Ember.Route.extend({
  model: function() {
    return $.get('url-to-my-data.json');
  }
});
```

In our case, we simply return the  static data that was in the component before:

```js
// app/routes/application.js
import Ember from 'ember';
import $ from 'jquery';

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
```

Then, in the template, we can feed the model into the component:

```
<!-- app/templates/application.hbs -->
{{bar-chart data=model}}
```

That's it! We now have a simple bar chart that we can easily feed data into.

## Line Chart

Next, we also want to implement a line chart.
When you think about it, a bar chart and a line chart share most things. 
Really, there are only two differences:

* The data is structured different
* The data is drawn different

### Chart Mixin

This would be a great opportunity for an abstract class / inheriting.
Sadly, as you may know, this is not that easily done in JavaScript.
However, Ember provides a somewhat similar concept: Mixins.
Each class can include one or more mixins. It can then override all properties/methods
from the mixin. So let's move all our general data into a `ChartMixin`!

A mixin can be generated with 

```
ember generate mixin chart
``` 

Then, copy _everything_ from the bar-chart component into the mixin, except for the `drawData()` function.

We can then import the chart mixin with `import ChartMixin from 'ember-d3-workshop/mixins/chart';`
and mix it into your class.
This leaves a bar-chart class that looks like this:

```js
// app/components/bar-chart.js
import Ember from 'ember';
import ChartMixin from 'ember-d3-workshop/mixins/chart';

export default Ember.Component.extend(ChartMixin, {

  drawData: function() {
    // ...
  } 

});
```

Everything should now continue to work exactly as before!

### Setup basic line chart

Now, let's generate a line chart component:

```
ember generate component line-chart
```

We'll also mix the chart mixin into this component, and create a stubbed drawData() function:

```js
// app/components/line-chart.js
import Ember from 'ember';
import ChartMixin from 'ember-d3-workshop/mixins/chart';

export default Ember.Component.extend(ChartMixin, {

  drawData: function() {
    // TODO: Implement this
  } 

});
```

Next, we'll want to adapt our data model:

```js
// app/routes/application.js
model: function() {
   var barChartData= [ ... ];
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
```

And adapt the application template:

```hbs
<!-- app/templates/application.hbs -->
<h2>Steps taken per day and person</h2>
{{line-chart data=model.lineChart}}

<h2>Age per person</h2>
{{bar-chart data=model.barChart}}
``` 

Now, we have our basic setup done. We only need to implement the `drawData()` function to see the actual graph.
But before that, we'll need to update the scales of the chart to reflect our changed data model.

### x-scale

For our simple data model, we simply want to have one point per array element of the `values` of the entries.
We assume that each item has the same amount of values.

```js
xScale: Ember.computed('data.[]', 'chartWidth', function() {
  var data = this.get('data');
  var width = this.get('chartWidth');

  var firstItem = data[0];
  var positions = firstItem.values.map(function(item, i) {
    return i;
  });

  var widthPiece = width / (positions.length - 1);
  var positionPoints = positions.map(function(position) {
    return widthPiece * position;
  });

  return d3.scaleOrdinal()
    .domain(positions)
    .range(positionPoints);
})
```

This is what is happening here:

* We create an array with the indicies of the values: `[0, 1, 2, 3]`
* For each of these items, we create a corresponding position on the x-axis based on the chart width
* We then use `scaleOrdinal` to map the indicicies to these calculated x-values

This way, the values for the different items will always be rendered at the same x-position.

### y-scale

The y-scale works the same way as for the bar-chart. 
The only difference is that we need to take all the values into account to
check for the lowest and highest possible score.

```js
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
})
```

Note that we use Ember's `Array.pushObjects(otherArray)`, which allows us to
append an array's elements to another array.
So we build an array containing all values from all items, and pass this combined array into 
`d3.extent()`. Then, we build the scale the same way as before.

### drawData

While the axes should now just work, we can now finally start implementing the `drawData()`
function.

```js
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
    .attr('d', function(d) {
      return line(d.values);
    })
    .attr('fill', 'none');
}
```

First, we define a `line`. This is a D3-construct, which has an x and a y
function. Through these, the position for each line segment is calculated.

Then, we select the lines like we did in the bar-chart, and define their data.
Like before, on the `enter()` function, we actually create the lines:

* Create & append a group `g` (and give it a class for later reference)
* Then, append an SVG path
* Then, give it a color. You can always access the whole item that has been passed in
* Then, define the special `d` property, and give it the line-method we defined before
* Don't forget to set `fill` to `none` to get the look we want to achieve

That's it! You should now have a working line chart, with each line in the specified color.

### Legend for the line chart

However, without a legend it is kind of hard to know which line stands for which person.
It is absolutely possible to create such legends with D3.
However, in this case it might be easier to just create it with plain HTML.
Let's go and add a legend in the application template:

```hbs
<!-- app/templates/application.hbs -->
<h2>Steps taken per day and person</h2>

{{#each model.lineChart as |person|}}
  <span style="color: {{person.color}};">
    {{person.name}}
  </span>
{{/each}}

{{line-chart data=model.lineChart}}
```

The `{{#each}}{{/each}}` block is a Handlebars construct.
Handlebars is the templating language used by Ember. It allows
to include simple logic into your templates.

We iterate over each item in the `model.lineChart` array.
For each of those, we create a span, set the color, and output the person's name.

While this is not a very pretty solution, it should be enough to illustrate how 
something like this can be done!

## Conclusion

There is much more that could/should be done here:

* While our chart will adapt to the available screen size, it will not resize 
if you resize your window.
* We currently don't handle chaning data & updating charts
* We could style our charts with CSS
* We could make our charts interactive, add hover states and much more

Still, this should be a good starting point for further exploration. 
There are a lot of great tutorials out there covering specific things in detail.
It can be difficult to get into the 'D3-Mindset'. But once you do,
you can do incredibly complex and awe-inducing things with it.

As an exercise, try to throw different/larger datasets at our components. 
See how D3 reacts to these changes. It will help you understand
what's going on under the hood.

Also, see the [Code Snippets](snippets.md) for general tips and tricks
surrounding D3.



