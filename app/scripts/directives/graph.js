'use strict';

/* global angular d3 window */

angular.module('graphApp')
  .directive('plotChart', function () {
    return {
      replace: false,
      scope: {
        graphData: '='
      },
      template: '<div></div>',
      link: function (scope, elem, attrs) {
        var chart = d3.select(elem[0]).append('svg')
          .attr('width', '100%')
          .attr('height', '100%');

        var offset_x = 40;
        var offset_y = 40;

        scope.dimensions = chart.node().getBoundingClientRect();

        scope.scene = {};

        d3.csv('/resources/tuloerot.csv')
          .row(function (d) {
            return {
              img: 'resources/flags_64/' + d['CountryCode'] + '.png',
              id: d['CountryCode'],
              label: d['Country'],
              x: d['Gini'],
              y: parseFloat(d['GDP growth']) * 100
            };
          })
          .get(function (errors, rows) {
            scope.scene = setup(rows);
            draw(scope.scene);
          });

        window.addEventListener('resize', function () {
          scope.dimensions = chart.node().getBoundingClientRect();
          draw(scope.scene);
        });

        function setup(data) {
          var scale_x = d3.scale.linear();

          var scale_y = d3.scale.linear();

          var axis_x = d3.svg.axis()
            .scale(scale_x)
            .orient('bottom');

          var axis_y = d3.svg.axis()
            .scale(scale_y)
            .orient('left');

          var group_x = chart.append('svg:g')
            .attr('class', 'x-axis');

          var group_y = chart.append('svg:g')
            .attr('class', 'y-axis');

          var group_plots = chart.append('svg:g');

          var group_toplevel = chart.append('svg:g');

          group_plots.selectAll('.point')
            .data(data)
            .enter()
            .append('image')
            .attr('class', 'point')
            .attr('xlink:href', function (d) {
              return d.img;
            })
            .attr('width', '32')
            .attr('height', '32');

          group_plots.selectAll('.point').each(function (d) {
            d3.select(this).on('mouseover', function (d) {
              var popup = chart
                .append('svg:g')
                .attr('id', d.id)
                .append('image')
                .attr('class', 'point')
                .attr('xlink:href', d.img)
                .attr('x', scale_x(d.x))
                .attr('y', scale_y(d.y))
                .attr('width', '32')
                .attr('height', '32')
                .on('mouseout', function () {
                  d3.select(this)
                    .transition()
                    .duration(400)
                    .attr('width', '32')
                    .attr('height', '32')
                    .attr('x', scale_x(d.x))
                    .attr('y', scale_y(d.y))
                    .each('end', function () {
                      if (self && self.remove) {
                        self.remove();
                      }
                    })
                })
                .transition()
                .duration(400)
                .attr('x', scale_x(d.x) - 16)
                .attr('y', scale_y(d.y) - 16)
                .attr('width', '64')
                .attr('height', '64');

              chart.select('#' + d.id)
                .on('mouseout', function () {
                  var self = d3.select(this);
                  var img = self.selectAll('image')
                    .transition()
                    .duration(400)
                    .attr('width', '32')
                    .attr('height', '32')
                    .attr('x', scale_x(d.x))
                    .attr('y', scale_y(d.y))
                    .each('end', function () {
                      self.remove();
                    })
                });
            });

          });

          return {
            data: data,
            scale_x: scale_x,
            scale_y: scale_y,
            axis_x: axis_x,
            axis_y: axis_y,
            group_x: group_x,
            group_y: group_y,
            group_plots: group_plots
          }
        }

        function draw(scene) {
          scene.scale_x.domain([0, d3.max(scene.data, function (d) {
            return d.x;
          }) * 1.2])
            .range([offset_x, scope.dimensions.width - offset_x]);

          scene.scale_y.domain([0, d3.max(scene.data, function (d) {
            return d.y;
          }) * 1.2])
            .range([scope.dimensions.height - offset_y, offset_y]);

          scene.group_x.attr('transform', 'translate(' + [0, scope.dimensions.height - offset_y] + ')')
            .call(scene.axis_x);

          scene.group_y.attr('transform', 'translate(' + [offset_x, 0] + ')')
            .call(scene.axis_y);

          scene.group_plots.selectAll('.point')
            .attr('x', function (d) {
              return scene.scale_x(d.x);
            })
            .attr('y', function (d) {
              return scene.scale_y(d.y);
            })
            .attr('r', 10);
        }
      }
    }
  }
)
;
