// SDK Needs to create video and canvas nodes in the DOM in order to function
      // Here we are adding those nodes a predefined div.
      var divRoot = document.querySelector("#affdex_elements");
      var width = 640;
      var height = 480;
      var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
      //Construct a CameraDetector and specify the image width / height and face detector mode.
      var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

      //Enable detection of all Expressions, Emotions and Emojis classifiers.
      detector.detectAllEmotions();
      detector.detectAllExpressions();
      detector.detectAllEmojis();
      detector.detectAllAppearance();

      //Add a callback to notify when the detector is initialized and ready for runing.
      detector.addEventListener("onInitializeSuccess", function() {
        
        //Display canvas instead of video feed because we want to draw the feature points on it
        document.querySelector("#face_video_canvas").style.display = "block";
        document.querySelector("#face_video").style.display = "none";
      });

      function log(node_name, msg) {
        document.querySelector(node_name).innerHTML += "<span>" + msg + "<\span><br />";
      }

      //function executes when Start button is pushed.
      function onStart() {
        if (detector && !detector.isRunning) {
          document.querySelector("#logs").innerHTML = "";
          detector.start();
        }
        log('#logs', "Clicked the start button");
      }

      //function executes when the Stop button is pushed.
      function onStop() {
        if (detector && detector.isRunning) {
          detector.removeEventListener();
          detector.stop();
        }
      };

      //function executes when the Reset button is pushed.
      function onReset() {

        if (detector && detector.isRunning) {
          detector.reset();

          document.querySelector('#results').innerHTML = "";
        }
      };

      //Add a callback to notify when camera access is allowed
      detector.addEventListener("onWebcamConnectSuccess", function() {
        log('#logs', "Webcam access allowed");
      });

      //Add a callback to notify when camera access is denied
      detector.addEventListener("onWebcamConnectFailure", function() {
        log('#logs', "webcam denied");
        console.log("Webcam access denied");
      });

      //Add a callback to notify when detector is stopped
      detector.addEventListener("onStopSuccess", function() {
        document.querySelector("#results").innerHTML = "";
      });

      //Add a callback to receive the results from processing an image.
      //The faces object contains the list of the faces detected in an image.
      //Faces object contains probabilities for all the different expressions, emotions and appearance metrics
      detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
        document.querySelector('#results').innerHTML = "";
        if (faces.length > 0) {
          
          log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);
          if(document.querySelector('#face_video_canvas') != null)
          	drawFeaturePoints(image, faces[0].featurePoints);
        }
      });

      //Draw the detected facial feature points on the image
      function drawFeaturePoints(img, featurePoints) {
        var contxt = document.querySelector('#face_video_canvas').getContext('2d');

        var hRatio = contxt.canvas.width / img.width;
        var vRatio = contxt.canvas.height / img.height;
        var ratio = Math.min(hRatio, vRatio);

        contxt.strokeStyle = "#FFFFFF";
        for (var id in featurePoints) {                   
          contxt.beginPath();
          contxt.arc(featurePoints[id].x,
            featurePoints[id].y, 2, 0, 2 * Math.PI);
          contxt.stroke();
        }
      }

function realTimeLineChart() {
    var margin = { top: 20, right: 20, bottom: 20, left: 20 },
        width = 650,
        height = 500,
        duration = 500,
        color = d3.schemeCategory10;

    function chart(selection) {
        selection.each(function (data) {
            data = ["Confusion", "Attention", "Engagement"].map(function (c) {
                return {
                    label: c,
                    values: data.map(function (d) {
                        return { time: +d.time, value: d[c] };
                    })
                };
            });

            var t = d3.transition().duration(duration).ease(d3.easeLinear),
                x = d3.scaleTime().rangeRound([0, width - margin.left - margin.right]),
                y = d3.scaleLinear().rangeRound([height - margin.top - margin.bottom, 0]),
                z = d3.scaleOrdinal(color);

            var xMin = d3.min(data, function (c) { return d3.min(c.values, function (d) { return d.time; }) });
            var xMax = new Date(new Date(d3.max(data, function (c) {
                return d3.max(c.values, function (d) { return d.time; })
            })).getTime() - (duration * 2));

            x.domain([xMin, xMax]);
            y.domain([
                d3.min(data, function (c) { return d3.min(c.values, function (d) { return d.value; }) }),
                d3.max(data, function (c) { return d3.max(c.values, function (d) { return d.value; }) })
            ]);
            z.domain(data.map(function (c) { return c.label; }));

            var line = d3.line()
                .curve(d3.curveBasis)
                .x(function (d) { return x(d.time); })
                .y(function (d) { return y(d.value); });

            var svg = d3.select(this).selectAll("svg").data([data]);
            var gEnter = svg.enter().append("svg").append("g");
            gEnter.append("g").attr("class", "axis x");
            gEnter.append("g").attr("class", "axis y");
            gEnter.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width - margin.left - margin.right)
                .attr("height", height - margin.top - margin.bottom);
            gEnter.append("g")
                .attr("class", "lines")
                .attr("clip-path", "url(#clip)")
                .selectAll(".data").data(data).enter()
                .append("path")
                .attr("class", "data");

            var legendEnter = gEnter.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + 445 + ",25)");
            legendEnter.append("rect")
                .attr("width", 140)
                .attr("height", 75)
                .attr("fill", "#FFFFFF")
                .attr("fill-opacity", 0);
            legendEnter.selectAll("text")
                .data(data).enter()
                .append("text")
                .attr("y", function (d, i) { return (i * 20) + 25; })
                .attr("x", -10)
                .attr("fill", function (d) { return z(d.label); });

            var svg = selection.select("svg");
            svg.attr('width', width).attr('height', height);
            var g = svg.select("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            g.select("g.axis.x")
                .attr("transform", "translate(0," + (height - margin.bottom - margin.top) + ")")
                .attr("stroke", "#FF69B4")
                .transition(t)
                .call(d3.axisBottom(x).ticks(3));
            g.select("g.axis.y")
                .attr("stroke", "#FF69B4")
                .transition(t)
                .attr("class", "axis y")
                .call(d3.axisLeft(y));

            g.select("defs clipPath rect")
                .transition(t)
                .attr("width", width - margin.left - margin.right)
                .attr("height", height - margin.top - margin.right);

            g.selectAll("g path.data")
                .data(data)
                .style("stroke", function (d) { return z(d.label); })
                .style("stroke-width", 1)
                .style("fill", "none")
                .transition()
                .duration(duration)
                .ease(d3.easeLinear)
                .on("start", tick);

            g.selectAll("g .legend text")
                .data(data)
                .text(function (d) {
                    return d.label.toUpperCase() + ": " + d.values[d.values.length - 1].value;
                });

            // For transitions https://bl.ocks.org/mbostock/1642874
            function tick() {
                d3.select(this)
                    .attr("d", function (d) { return line(d.values); })
                    .attr("transform", null);

                var xMinLess = new Date(new Date(xMin).getTime() - duration);
                d3.active(this)
                    .attr("transform", "translate(" + x(xMinLess) + ",0)")
                    .transition()
                    .on("start", tick);
            }
        });
    }

    chart.margin = function (_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.width = function (_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function (_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    chart.color = function (_) {
        if (!arguments.length) return color;
        color = _;
        return chart;
    };

    chart.duration = function (_) {
        if (!arguments.length) return duration;
        duration = _;
        return chart;
    };

    return chart;
}