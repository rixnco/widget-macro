# com-chilipeppr-widget-macro
Edit and run Javascript macros inside ChiliPeppr. Lots of sample macros too.

![alt text](screenshot.png "Screenshot")

## ChiliPeppr Widget / Macro

All ChiliPeppr widgets/elements are defined using cpdefine() which is a method
that mimics require.js. Each defined object must have a unique ID so it does
not conflict with other ChiliPeppr widgets.

| Item                  | Value           |
| -------------         | ------------- | 
| ID                    | com-chilipeppr-widget-macro |
| Name                  | Widget / Macro |
| Description           | Edit and run Javascript macros inside ChiliPeppr. Lots of sample macros too. |
| chilipeppr.load() URL | http://raw.githubusercontent.com/chilipeppr/com-chilipeppr-widget-macro/master/auto-generated-widget.html |
| Edit URL              | http://ide.c9.io/chilipeppr/com-chilipeppr-widget-macro |
| Github URL            | http://github.com/chilipeppr/com-chilipeppr-widget-macro |
| Test URL              | https://preview.c9users.io/chilipeppr/com-chilipeppr-widget-macro/widget.html |

## Example Code for chilipeppr.load() Statement

You can use the code below as a starting point for instantiating this widget 
inside a workspace or from another widget. The key is that you need to load 
your widget inlined into a div so the DOM can parse your HTML, CSS, and 
Javascript. Then you use cprequire() to find your widget's Javascript and get 
back the instance of it.

```javascript
chilipeppr.load(
  "#myDivWidgetInsertedInto",
  "http://raw.githubusercontent.com/chilipeppr/com-chilipeppr-widget-macro/master/auto-generated-widget.html",
  function() {
    // Callback after widget loaded into #myDivWidgetInsertedInto
    cprequire(
      "inline:com-chilipeppr-widget-macro", // the id you gave your widget
      function(mywidget) {
        // Callback that is passed reference to your newly loaded widget
        console.log("My widget just got loaded.", mywidget);
        mywidget.init();
      }
    );
  }
);

```

## Publish

This widget/element publishes the following signals. These signals are owned by this widget/element and are published to all objects inside the ChiliPeppr environment that listen to them via the 
chilipeppr.subscribe(signal, callback) method. 
To better understand how ChiliPeppr's subscribe() method works see amplify.js's documentation at http://amplifyjs.com/api/pubsub/

| Signal | Description |
| ------ | ----------- |
| (No signals defined in this widget/element) |

## Subscribe

This widget/element subscribes to the following signals. These signals are owned by this widget/element. Other objects inside the ChiliPeppr environment can publish to these signals via the chilipeppr.publish(signal, data) method. 
To better understand how ChiliPeppr's publish() method works see amplify.js's documentation at http://amplifyjs.com/api/pubsub/

| Signal | Description |
| ------ | ----------- |
| (No signals defined in this widget/element) |

## Foreign Publish

This widget/element publishes to the following signals that are owned by other objects. 
To better understand how ChiliPeppr's subscribe() method works see amplify.js's documentation at http://amplifyjs.com/api/pubsub/

| Signal | Description |
| ------ | ----------- |
| (No signals defined in this widget/element) |

## Foreign Subscribe

This widget/element publishes to the following signals that are owned by other objects.
To better understand how ChiliPeppr's publish() method works see amplify.js's documentation at http://amplifyjs.com/api/pubsub/

| Signal | Description |
| ------ | ----------- |
| (No signals defined in this widget/element) |

## Methods / Properties

The table below shows, in order, the methods and properties inside the widget/element.

| Item                  | Type          | Description |
| -------------         | ------------- | ----------- |
| id | string | "com-chilipeppr-widget-macro"<br><br>The ID of the widget. You must define this and make it unique. |
| name | string | "Widget / Macro" |
| desc | string | "Edit and run Javascript macros inside ChiliPeppr. Lots of sample macros too." |
| url | string | "http://raw.githubusercontent.com/chilipeppr/com-chilipeppr-widget-macro/master/auto-generated-widget.html" |
| fiddleurl | string | "http://ide.c9.io/chilipeppr/com-chilipeppr-widget-macro" |
| githuburl | string | "http://github.com/chilipeppr/com-chilipeppr-widget-macro" |
| testurl | string | "http://com-chilipeppr-widget-macro-chilipeppr.c9users.io/widget.html" |
| publish | object | Please see docs above.<br><br>Define the publish signals that this widget/element owns or defines so thatother widgets know how to subscribe to them and what they do. |
| subscribe | object | Please see docs above.<br><br>Define the subscribe signals that this widget/element owns or defines so thatother widgets know how to subscribe to them and what they do. |
| foreignPublish | object | Please see docs above.<br><br>Document the foreign publish signals, i.e. signals owned by other widgetsor elements, that this widget/element publishes to. |
| foreignSubscribe | object | Please see docs above.<br><br>Document the foreign subscribe signals, i.e. signals owned by other widgetsor elements, that this widget/element subscribes to. |
| jscript | object |  |
| init | function | function ()  |
| setupStartup | function | function ()  |
| onStartup | function | function ()  |
| editStartup | function | function (evt)  |
| saveStartup | function | function (evt)  |
| makeTextareaAcceptTabs | function | function ()  |
| getJscript | function | function ()  |
| runMacro | function | function (macroStr, helpTxt)  |
| jscriptKeypress | function | function (evt)  |
| showData | function | function (datatxt)  |
| saveMacro | function | function ()  |
| deleteRecentFiles | function | function ()  |
| createRecentFileEntry | function | function (fileStr, info)  |
| buildRecentFileMenu | function | function ()  |
| loadFileFromLocalStorageKey | function | function (key)  |
| loadJscript | function | function (txt)  |
| setupSamples | function | function ()  |
| getMethodString | function | function (methodToGet)  |
| watchChiliPepprPauseSolderDispenser | function | function ()  |
| watchChiliPepprPause | function | function ()  |
| flashMsg | function | function ()  |
| get3dobj | function | function ()  |
| get3dobjG1FromG2G3 | function | function ()  |
| injectBtn | function | function ()  |
| rewriteGcode | function | function ()  |
| watchOnCompleteControlArduino | function | function ()  |
| iterateGcode | function | function ()  |
| injectCams | function | function ()  |
| downloadGcode | function | function ()  |
| sendToArduino | function | function ()  |
| cmdsSentViaTimeout | function | function ()  |
| addbbox | function | function ()  |
| fadeout | function | function ()  |
| sendGcodeToWorkspace | function | function ()  |
| runTestProbe | function | function ()  |
| watch | function | function ()  |
| sendSerial | function | function (gcode)  |
| statEl | object |  |
| status | function | function (txt)  |
| getZMinSettings | function | function (donecallback)  |
| threeDGetUserObject | function | function ()  |
| threeDMakeText | function | function (vals)  |
| forkSetup | function | function ()  |


## About ChiliPeppr

[ChiliPeppr](http://chilipeppr.com) is a hardware fiddle, meaning it is a 
website that lets you easily
create a workspace to fiddle with your hardware from software. ChiliPeppr provides
a [Serial Port JSON Server](https://github.com/johnlauer/serial-port-json-server) 
that you run locally on your computer, or remotely on another computer, to connect to 
the serial port of your hardware like an Arduino or other microcontroller.

You then create a workspace at ChiliPeppr.com that connects to your hardware 
by starting from scratch or forking somebody else's
workspace that is close to what you are after. Then you write widgets in
Javascript that interact with your hardware by forking the base template 
widget or forking another widget that
is similar to what you are trying to build.

ChiliPeppr is massively capable such that the workspaces for 
[TinyG](http://chilipeppr.com/tinyg) and [Grbl](http://chilipeppr.com/grbl) CNC 
controllers have become full-fledged CNC machine management software used by
tens of thousands.

ChiliPeppr has inspired many people in the hardware/software world to use the
browser and Javascript as the foundation for interacting with hardware. The
Arduino team in Italy caught wind of ChiliPeppr and now
ChiliPeppr's Serial Port JSON Server is the basis for the 
[Arduino's new web IDE](https://create.arduino.cc/). If the Arduino team is excited about building on top
of ChiliPeppr, what
will you build on top of it?



