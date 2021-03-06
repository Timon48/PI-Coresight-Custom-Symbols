
/**
# ***********************************************************************
# * DISCLAIMER:
# *
# * All sample code is provided by OSIsoft for illustrative purposes only.
# * These examples have not been thoroughly tested under all conditions.
# * OSIsoft provides no guarantee nor implies any reliability,
# * serviceability, or function of these programs.
# * ALL PROGRAMS CONTAINED HEREIN ARE PROVIDED TO YOU "AS IS"
# * WITHOUT ANY WARRANTIES OF ANY KIND. ALL WARRANTIES INCLUDING
# * THE IMPLIED WARRANTIES OF NON-INFRINGEMENT, MERCHANTABILITY
# * AND FITNESS FOR A PARTICULAR PURPOSE ARE EXPRESSLY DISCLAIMED.
# ************************************************************************
#
# Visualizations provided by amCharts: https://www.amcharts.com/
#
**/

//************************************
// Begin defining a new symbol
//************************************
(function (CS) {
	//'use strict';
	
	var myCustomSymbolDefinition = {

		typeName: 'amcharts-linechart',
		displayName: 'amCharts Line Chart',
		datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
		iconUrl: 'Scripts/app/editor/symbols/ext/Icons/LineChart.png',
		visObjectType: symbolVis,
		getDefaultConfig: function () {
			return {
				DataShape: 'TimeSeries',
				DataQueryMode: CS.Extensibility.Enums.DataQueryMode.ModePlotValues,
				Height: 300,
				Width: 600,
				BackgroundColor: "",
				TextColor: "#ffffff",
				Graphs: [],
				Rotate: false,
				LabelRotation: 0,
				LegendPosition: "right"
				
            };
		},
	
        configOptions: function () {
            return [{
				title: 'Format Symbol',
                mode: 'format'
            }];
        },
 
	};
	
	
	
	function symbolVis() { };
    CS.deriveVisualizationFromBase(symbolVis);
	
	
	symbolVis.prototype.init = function(scope, elem) {	
		this.onDataUpdate = dataUpdate;
		this.onConfigChange = configChange;
		
		scope.config.Bullets = [
			"none","round","square", "triangleUp", "triangleDown", "bubble"//, "custom"
		];
		
		scope.config.GraphTypes = [
			"line", "column", "step", "smoothedLine"
		];
		
		scope.config.Positions = [
			"left", "right", "top", "bottom"
		];
		
		scope.config.DataSources = scope.symbol.DataSources;
		scope.config.Graphs = scope.config.Graphs.length > 0 ? scope.config.Graphs : initGraphs(scope.config.DataSources);
	
		var chart = initChart(scope.config);
		if(chart.graphs[0].lineColor == ""){
			scope.config.Graphs.forEach(function(graph,index){
				graph.lineColor = chart.graphs[index].lineColorR;
				graph.bulletColor = chart.graphs[index].lineColorR;
			});
				
				
			
			
		}
		
		
		function initChart(config){
			var symbolContainerDiv = elem.find('#container')[0];
			symbolContainerDiv.id = "myCustomSymbol_" + Math.random().toString(36).substr(2, 16);
								
			var chartconfig = getChartConfig(config);
					
			var customVisualizationObject = AmCharts.makeChart(symbolContainerDiv.id, chartconfig);
			
		
			return customVisualizationObject;
		};		
		
		
		function configChange(newConfig, oldConfig) {
			
            if (chart && newConfig && oldConfig && !angular.equals(newConfig, oldConfig)) {			
				var newdatasoucres = _.difference(newConfig.DataSources, oldConfig.DataSources);
					if(newdatasoucres.length > 0){
						var newGraphs = initGraphs(newdatasoucres);
						var index = scope.config.Graphs.length;
						scope.config.Graphs =  scope.config.Graphs.concat(newGraphs);

					}
    
				//console.log('newConfig',newConfig);
				//console.log('chart',chart);
				chart.graphs = getGraphs(scope.config.Graphs);
				chart.color = scope.config.TextColor;
				chart.rotate = scope.config.Rotate;
				chart.categoryAxis.labelRotation =  scope.config.LabelRotation;
				chart.legend.position = scope.config.LegendPosition;
			//	console.log('test', chart);
				
				

				chart.validateData();
				//	console.log('config log', scope.config.BackgroundColor);
            
			}
			
        };
			
		function dataUpdate(newdata) { 
			//console.log('newdata',newdata);
			if (!newdata || !chart) return;
			var dataprovider = convertToChartDataFormat(newdata);		
			//console.log('dataprovider', dataprovider);
			chart.dataProvider = dataprovider;
			chart.validateData();
			chart.animateAgain();			
			
			//console.log('newdata', newdata.Data[0].Values[0]);
			
			//console.log('provider', chart.dataProvider[0]);
			
		}
             
		 function convertToChartDataFormat(newdata) {		
			return _.chain(newdata.Data)
					.map(function(dataArray,index){
						return dataArray.Values.map(function(dataitem){
								var datetime = new Date(dataitem.Time);
								var starttime = new Date(dataArray.StartTime);
								return datetime >= starttime 
										? _.object(['Value' + index, 'Time', 'DateTime'], [dataitem.Value, dataitem.Time, datetime])
										: undefined;
							});
					})
					.flatten()
					.compact()
					.groupBy(function(item){return item.Time})
					.map(function(item){
						if (_.size(item) > 1){
							var merged = {};
							item.forEach(function(item){_.defaults(merged,item)});	
							return merged;
						}
						else{
							return item[0];
						}	
					})
					.sortBy('DateTime')
					.value();			
		 }
		

		
		function initGraphs(datasources){
			return datasources.map(function(item){
				var isAttribute = /af:/.test(item);
				var label = isAttribute ? item.match(/\w*\|.*$/)[0] : item.match(/(\w+)\?*[0-9]*$/)[1];
				var index = scope.symbol.DataSources.indexOf(item);
				
				return {
						balloonText: "<span style='font-size:13px'>[[title]]</span><br> <span style='font-size:18px'>[[Time]]</span><br><span style='font-size:18px'>[[Value" + index + "]]</span>",
						/* <b> [[title]] </b><br>[[Time]] <br> [[Value"+index+@"]]" */
						title: label,
						valueField: "Value" + index,
						bullet: "round",
						lineColor: '', //'#'+Math.floor(Math.random()*16777215).toString(16),
						lineThickness: 1,
						type: "line",
						bulletColor: "rgba(0,0,0,0)",
						fixedColumnWidth: 25
					//	connect: false
				}
				
			});			
		};
        
		function getGraphs(graphs){
			return graphs.map(function(graph){
				return {
					balloonText: graph.balloonText,
					title: graph.title,
					valueField: graph.valueField,
					bullet: graph.bullet,
					lineColor: graph.lineColor,
					lineThickness: graph.lineThickness,
					type: graph.type,
					bulletColor: graph.bulletColor,
					fixedColumnWidth: parseInt(graph.fixedColumnWidth)
			//		connect: graph.connect
				};
				
			});
			
		};
		
		function getChartConfig(config) {
            return {
						"type": "serial",
						"theme": "dark",
						"rotate": config.Rotate,
						"color": config.TextColor,
						//"plotAreaFillColors": scope.config.plotAreaFillColor,
						//"fontFamily": "arial",
						//"marginRight": 30,
						//"creditsPosition": "bottom-right",
						//"titles": createArrayOfChartTitles(),
                        //"fontSize": 12,
						
						"valueAxes": [{
							"position": "left",
							"title": "Value"
						}],    
						"categoryField": "Time",
						"categoryAxis": {
							"title": "Time",
							"labelRotation": config.LabelRotation,
							"parseDates": true,
							"minPeriod":"ss",
						//	"type": "date"

						},
						"graphs": getGraphs(config.Graphs),					 
						"dataProvider": "",						
						"chartCursor": { 
						//	"cursorColor": "gray",
							"valueLineBalloonEnabled": true,
							"valueLineEnabled": true,
							"valueZoomable": true
						},
					//	"zoomOutButtonImage": "",
						"legend": {
							"enabled": true,
							"useGraphSettings": true,
							"position": config.LegendPosition
							
						},
						"chartScrollbar": {
							"enabled": false
						} 
					}
        }

	}
	CS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.Coresight);