/**
 * @file
 * Contains the definition of the behaviour main.js.
 */

(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.drawPaint = {
  	attach: function(context, settings) {

  		var canvas_data = drupalSettings.drawing_tool.canvas_data;
  		var commands_basic = drupalSettings.drawing_tool.basic_commands_data;
  		var configs = drupalSettings.drawing_tool.configs;

  		if (canvas_data != 'NULL' && commands_basic != 'NULL') {

  			// get the CsrfToken from drupal session
				function getCsrfToken(callback) {
				  jQuery
				    .get(Drupal.url('rest/session/token'))
				    .done(function (data) {
				      var csrfToken = data;
				      callback(csrfToken);
				    });
				}

				// Requet to PATCH the node
				function patchNode(csrfToken, node, nodeId) {
					  jQuery.ajax({
					    url: 'http://project.dd:8083/node/' + nodeId + '?_format=json',
					    method: 'PATCH',
					    headers: {
					      'Content-Type': 'application/hal+json',
					      'Accept' : 'json',
					      'X-CSRF-Token': csrfToken
					    },
					    data: JSON.stringify(node),
					    success: function (node) {

					    		var type = commands_basic[nodeId]['command'];
					    		var lineX1 = commands_basic[nodeId]['value_x_1'];
							    var lineY1 = commands_basic[nodeId]['value_y_1'];
							    var lineX2 = commands_basic[nodeId]['value_x_2'];
							    var lineY2 = commands_basic[nodeId]['value_y_2'];
							    var colour = configs[nodeId]['colour'];
							    var size = configs[nodeId]['size'];

					    		var i = 0;

					    		while(i < commands_basic[nodeId]['command'].length) {
					    			paint(lineX1[i], lineY1[i], lineX2[i], lineY2[i], type[i], nodeId, colour, size);
					    			i++;
					    		}

					    }
					  });
				  }

				// Function to draw in canvas the commands.
				function paint(x1, y1, x2, y2, option, id, c, s) {

					var element = $('[class^="canvas-id-' + id + '"]');
			    var ctx = element[0].getContext('2d');
			    ctx.strokeStyle = c;
			    ctx.lineWidth = s;

			    switch (option) {
			        case 'Rectangle':

			            x2 = x2 - x1;
			            y2 = y2 - y1;

			            ctx.strokeRect(x1, y1, x2, y2);
			            break;

			        case 'Line':

			            ctx.beginPath();
			            ctx.moveTo(x1, y1);
			            ctx.lineTo(x2, y2);
			            ctx.stroke();
			            break;

			        default:
			            break;
			    }
				}

				$.each(canvas_data, function ( index ) {

					var newNode = {
					  _links: {
					    type: {
					      href: 'http://project.dd:8083/rest/type/node/draw'
					    }
					  },
					  type: {
					    target_id: 'draw'
					  },
					  field_body: [{
					  	format: 'full_html',
					  	value: '<canvas class="canvas-id-' + index + '">Your Browser is not supported</canvas>'
					  }]
					};

					$('[class^="canvas-id-' + index + '"]').css({
						'width': canvas_data[index]['width'],
						'height': canvas_data[index]['height']
					}); 
					
					getCsrfToken(function (csrfToken) {
					  patchNode(csrfToken, newNode, index);
					});

					

				});

  		}
			
  	}
	}

})(jQuery, Drupal, drupalSettings);
