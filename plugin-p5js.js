// p5.js integration


var jsPsychP5JS = (function (jspsych) {
  'use strict';

  const info = {
      name: "p5js",
      parameters: {
          /** The p5 js setup func */
          setup_func: {
              type: jspsych.ParameterType.FUNCTION,
              pretty_name: "Setup",
              default: undefined,
          },
          /** The p5 js draw func */
          draw_func: {
              type: jspsych.ParameterType.FUNCTION,
              pretty_name: "Draw",
              default: undefined,
          },
          /** The p5 js top level (same as setup and draw) variables and functions */
          top_level_declarations:{
            type: jspsych.ParameterType.FUNCTION,
            pretty_name: "Declare top level functions and variables",
            default: function (p) {},           
          },
          /** Array containing the label(s) for the button(s). */
          button_choices: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Button Choices",
              default: [],
              array: true,
          },
            /** Array containing the key(s) the subject is allowed to press to respond to the stimulus. */
          key_choices: {
              type: jspsych.ParameterType.KEYS,
              pretty_name: "Key Choices",
              default: "ALL_KEYS", // alternatively set to "NO_KEYS" if key presses are not allowed
          },
          /** The html of the button. Can create own style. */
          button_html: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Button HTML",
              default: '<button class="jspsych-btn">%choice%</button>',
              array: true,
          },
          /** Any content here will be displayed under the button. */
          prompt: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Prompt",
              default: null,
          },
          /** How long to show the p5.js canvas. */
          stimulus_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Stimulus duration",
              default: null,
          },
          /** How long to show the trial. */
          trial_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Trial duration",
              default: null,
          },
          /** The vertical margin of the button. */
          margin_vertical: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Margin vertical",
              default: "0px",
          },
          /** The horizontal margin of the button. */
          margin_horizontal: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Margin horizontal",
              default: "8px",
          },
          /** If true, then trial will end when user responds. */
          response_ends_trial: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Response ends trial",
              default: true,
          }
      },
  };
  /**
   * **p5js**
   *
   * jsPsych plugin for displaying a canvas stimulus using p5.js 
   *
   * @author Andre Sahakian (modified from (Chris Jungerius (modified from Josh de Leeuw))
   * 
   */
  class P5JSPlugin {
      constructor(jsPsych) {
          this.jsPsych = jsPsych;
      }
      trial(display_element, trial) {



          // create div to hold the canvas
          var html = '<div id="jspsych-p5js-stimulus"></div>'  ;
              

             
          

          //display buttons
          var buttons = [];
          if (Array.isArray(trial.button_html)) {
              if (trial.button_html.length == trial.button_choices.length) {
                  buttons = trial.button_html;
              }
              else {
                  console.error("Error in p5js plugin. The length of the button_html array does not equal the length of the button_choices array");
              }
          }
          else {
              for (var i = 0; i < trial.button_choices.length; i++) {
                  buttons.push(trial.button_html);
              }
          }

          
          html += '<div id="jspsych-p5js-btngroup">';
          for (var i = 0; i < trial.button_choices.length; i++) {
              var str = buttons[i].replace(/%choice%/g, trial.button_choices[i]);
              html +=
                  '<div class="jspsych-p5js-button" style="display: inline-block; margin:' +
                      trial.margin_vertical +
                      " " +
                      trial.margin_horizontal +
                      '" id="jspsych-p5js-button-' +
                      i +
                      '" data-choice="' +
                      i +
                      '">' +
                      str +
                      "</div>";
          }
          html += "</div>";


          //show prompt if there is one
          if (trial.prompt !== null) {
              html += trial.prompt;
          }
          display_element.innerHTML = html;

          // set up p5 js  setup and draw functions
          function p5js_sketch(p) {

            p.setup = function () {
                trial.setup_func(p)
            }
            
            p.draw = function () {
                trial.draw_func(p)                
            }

            trial.top_level_declarations(p)
          }
          
          // place the p5 js canvas in the designated div
          new p5(p5js_sketch, "jspsych-p5js-stimulus")

          // start time
          var start_time = performance.now();
          
          // add event listeners to buttons
          for (var i = 0; i < trial.button_choices.length; i++) {
              display_element
                  .querySelector("#jspsych-p5js-button-" + i)
                  .addEventListener("click", (e) => {
                  var btn_el = e.currentTarget;
                  var button_choice = btn_el.getAttribute("data-choice"); // don't use dataset for jsdom compatibility
                  after_button_response(button_choice);
              });
          }


          // store response
          var response = {
              rt: null,
              button: null,
              key: null,
          };


          // function to end trial when it is time
          const end_trial = () => {
              // kill any remaining setTimeout handlers
              this.jsPsych.pluginAPI.clearAllTimeouts();

              // kill keyboard listeners
              if (typeof keyboardListener !== "undefined") {
                this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
              }


              // gather the data to store for the trial
              var trial_data = {
                  rt: response.rt,
                  response: {
                    button: response.button, 
                    key: response.key,
                },
              };
              // clear the display
              display_element.innerHTML = "";
              // move on to the next trial
              this.jsPsych.finishTrial(trial_data);
          };


          // function to handle responses by the subject
          function after_button_response(choice) {
              // measure rt
              var end_time = performance.now();
              var rt = Math.round(end_time - start_time);
              response.button = parseInt(choice);
              response.rt = rt;
              // after a valid response, the stimulus will have the CSS class 'responded'
              // which can be used to provide visual feedback that a response was recorded
              display_element.querySelector("#jspsych-p5js-stimulus").className +=
                  " responded";
              // disable all the buttons after a response
              var btns = document.querySelectorAll(".jspsych-p5js-button button");
              for (var i = 0; i < btns.length; i++) {
                  //btns[i].removeEventListener('click');
                  btns[i].setAttribute("disabled", "disabled");
              }

              if (trial.response_ends_trial) {
                  end_trial();
              }
          }
          // function to handle responses by the subject
          var after_key_response = (info) => {
            // after a valid response, the stimulus will have the CSS class 'responded'
            // which can be used to provide visual feedback that a response was recorded
            display_element.querySelector("#jspsych-p5js-stimulus").className +=
                  " responded";
            // only record the first response
            if (response.key == null) {
                response = info;
                // add button response as null
                response.button = null
            }
            if (trial.response_ends_trial) {
                end_trial();
            }
         };

          // start the response listener
          if (trial.key_choices != "NO_KEYS") {
            var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: after_key_response,
                valid_responses: trial.key_choices,
                rt_method: "performance",
                persist: false,
                allow_held_key: false,
            });
        }

          // hide image if timing is set
          if (trial.stimulus_duration !== null) {
              this.jsPsych.pluginAPI.setTimeout(() => {
                  display_element.querySelector("#jspsych-p5js-stimulus").style.visibility = "hidden";
              }, trial.stimulus_duration);
          }
          // end trial if time limit is set
          if (trial.trial_duration !== null) {
              this.jsPsych.pluginAPI.setTimeout(() => {
                  end_trial();
              }, trial.trial_duration);
          }
      }

  }
  P5JSPlugin.info = info;

  return P5JSPlugin;

})(jsPsychModule);
