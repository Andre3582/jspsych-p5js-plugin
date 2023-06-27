# jspsych-p5js-plugin

A jsPsych plugin that allows to run [p5.js](https://p5js.org/) sketches as a [jsPsych](https://www.jspsych.org/) trial. 
See 'experiment.html' for some basic to relatively advanced implementations.

In principle, any example ([p5js.org/examples](https://p5js.org/examples/)) or other sketch can be copy pasted into a trial with minimal changes*.

For convenience I have added the functionality of responding with key presses or buttons.

*You need to prefix any standard p5.js function or constant with `p.`, and top level declarations with `p.TLD.` (tip: ask ChatGPT to do it for you). 
