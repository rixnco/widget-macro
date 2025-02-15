/* global macro requirejs cprequire cpdefine chilipeppr THREE */
// ignore this errormessage:

// ChiliPeppr Widget/Element Javascript
cprequire_test(["inline:com-chilipeppr-widget-macro"], function(myWidget) {

    // Test this element. This code is auto-removed by the chilipeppr.load()
    // when using this widget in production. So use the cpquire_test to do things
    // you only want to have happen during testing, like loading other widgets or
    // doing unit tests. Don't remove end_test at the end or auto-remove will fail.

    console.log("test running of " + myWidget.id);

    $('body').prepend('<div id="testDivForFlashMessageWidget"></div>');
    $('#com-chilipeppr-widget-macro').css('margin', '10px');

    chilipeppr.load(
        "#testDivForFlashMessageWidget",
        "http://raw.githubusercontent.com/rixnco/element-flash/master/auto-generated-widget.html",
        function() {
            console.log("mycallback got called after loading flash msg module");
            cprequire(["inline:com-chilipeppr-elem-flashmsg"], function(fm) {
                //console.log("inside require of " + fm.id);
                fm.init();
            });
        }
    );

    // init my widget
    myWidget.init();

} /*end_test*/ );

// This is the main definition of your widget. Give it a unique name.
cpdefine("inline:com-chilipeppr-widget-macro", ["chilipeppr_ready", /* other dependencies here */ ], function() {
    return {
        /**
         * The ID of the widget. You must define this and make it unique.
         */
        id: "com-chilipeppr-widget-macro", // Make the id the same as the cpdefine id
        name: "Widget / Macro", // The descriptive name of your widget.
        desc: "Edit and run Javascript macros inside ChiliPeppr. Lots of sample macros too.", // A description of what your widget does
        url: "(auto fill by runme.js)",       // The final URL of the working widget as a single HTML file with CSS and Javascript inlined. You can let runme.js auto fill this if you are using Cloud9.
        fiddleurl: "(auto fill by runme.js)", // The edit URL. This can be auto-filled by runme.js in Cloud9 if you'd like, or just define it on your own to help people know where they can edit/fork your widget
        githuburl: "(auto fill by runme.js)", // The backing github repo
        testurl: "(auto fill by runme.js)",   // The standalone working widget so can view it working by itself
        /**
         * Define pubsub signals below. These are basically ChiliPeppr's event system.
         * ChiliPeppr uses amplify.js's pubsub system so please refer to docs at
         * http://amplifyjs.com/api/pubsub/
         */
        /**
         * Define the publish signals that this widget/element owns or defines so that
         * other widgets know how to subscribe to them and what they do.
         */
        publish: {
            // Define a key:value pair here as strings to document what signals you publish.
        },
        /**
         * Define the subscribe signals that this widget/element owns or defines so that
         * other widgets know how to subscribe to them and what they do.
         */
        subscribe: {
            // Define a key:value pair here as strings to document what signals you subscribe to
            // so other widgets can publish to this widget to have it do something.
            // '/onExampleConsume': 'Example: This widget subscribe to this signal so other widgets can send to us and we'll do something with it.'
        },
        /**
         * Document the foreign publish signals, i.e. signals owned by other widgets
         * or elements, that this widget/element publishes to.
         */
        foreignPublish: {
            // Define a key:value pair here as strings to document what signals you publish to
            // that are owned by foreign/other widgets.
            // '/jsonSend': 'Example: We send Gcode to the serial port widget to do stuff with the CNC controller.'
        },
        /**
         * Document the foreign subscribe signals, i.e. signals owned by other widgets
         * or elements, that this widget/element subscribes to.
         */
        foreignSubscribe: {
            // Define a key:value pair here as strings to document what signals you subscribe to
            // that are owned by foreign/other widgets.
            // '/com-chilipeppr-elem-dragdrop/ondropped': 'Example: We subscribe to this signal at a higher priority to intercept the signal. We do not let it propagate by returning false.'
        },
        jscript: null, // contains the javascript macro that the user is working with
        init: function () {

            this.forkSetup();
            
            $('.com-chilipeppr-widget-macro-run').click(this.runMacro.bind(this));
            
            // saveMacro
            $('.com-chilipeppr-widget-macro-save').click(this.saveMacro.bind(this));
            
            // setup del files
            $('#com-chilipeppr-widget-macro .recent-file-delete').click( this.deleteRecentFiles.bind(this));

            this.buildRecentFileMenu();
            
            // make this object available in global namespace
            window['macro'] = this;
            console.log("made macro obj (this) available in global namepace so you can call macro.status(), etc:", macro);
            
            // capture ctrl+enter on textarea
            $('.com-chilipeppr-widget-macro-jscript').keypress(this.jscriptKeypress.bind(this));
            
            // samples
            this.setupSamples();
            
            this.makeTextareaAcceptTabs();
            
            // popovers
            $('#com-chilipeppr-widget-macro .panel-heading .btn').popover();
            
            // see if startup script
            this.setupStartup();
            
            console.log(this.name + " done loading.");
        },
        setupStartup: function() {
            
            // setup pulldown menu items
            $('.com-chilipeppr-widget-macro-startup-load').click(this.editStartup.bind(this));
            $('.com-chilipeppr-widget-macro-startup-save').click(this.saveStartup.bind(this));
            
            // run startup script
            this.onStartup();
            
        },
        onStartup: function() {
            
            // check if there's a startup script. if so, load and execute it
            // but only do it a bit later to give user time to hold shift key and
            // so other widgets are loaded
            var that = this;
            setTimeout(function() {
                
                // see if they want to bypass
                var href = window.location.href;
                if (href && href.length > 0 && href.match(/nostartup=true/i)) {
                    console.log("Bypassing startup script.");
                    that.status("Bypassed startup script since ?nostartup=true in URL");

                } else {
                    var ss = localStorage.getItem('com-chilipeppr-widget-macro-startup');
                    if (ss && ss.length > 0) {
                        // there is a startup script
                        console.log("There is a startup script. Run it.", ss);
                        that.runMacro(ss, "startup");
                    } else {
                        console.log("No startup script to run.");
                        that.status("No startup script to run.");
                    }
                }

            }, 5000);
            
            // see if shift is currently pressed though and skip execution
          
        },
        editStartup: function(evt) {
            console.log("editStartup. evt:", evt);
            
            var script = localStorage.getItem('com-chilipeppr-widget-macro-startup');
            this.jscript = script;
            this.loadJscript(this.jscript);
            this.status("Loaded startup script");
            
        },
        saveStartup: function(evt) {
            console.log("saveStartup. evt:", evt);
            var fileStr = this.getJscript();
            localStorage.setItem('com-chilipeppr-widget-macro-startup', fileStr);
            this.status("Saved startup script");
        },
        makeTextareaAcceptTabs: function() {
            $(document).delegate('.com-chilipeppr-widget-macro-jscript', 'keydown', function(e) {
                var keyCode = e.keyCode || e.which;
                
                if (keyCode == 9) {
                    e.preventDefault();
                    var start = $(this).get(0).selectionStart;
                    var end = $(this).get(0).selectionEnd;
                    
                    // set textarea value to: text before caret + tab + text after caret
                    $(this).val($(this).val().substring(0, start)
                                + "\t"
                                + $(this).val().substring(end));
                    
                    // put caret at right position again
                    $(this).get(0).selectionStart =
                        $(this).get(0).selectionEnd = start + 1;
                }
            });
        },
        getJscript: function() {
            this.jscript = $('.com-chilipeppr-widget-macro-jscript').val();
            return this.jscript;
        },
        runMacro: function(macroStr, helpTxt) {
                        
            // allow a custom macro to be passed in
            if (typeof macroStr === "string") {
                this.jscript = macroStr;
            } else {
                this.getJscript();
            }
            
            //this.jscript = $('.com-chilipeppr-widget-macro-jscript').val();
            
            if (this.jscript && this.jscript.length > 1) {
            try {
                eval(this.jscript);
                
                if (!helpTxt) helpTxt = "";
                helpTxt = helpTxt.trim();
                if (helpTxt.length > 0) helpTxt += " ";

                this.status("Ran " + helpTxt + "macro. "); // + this.jscript);
            } catch(e) {
                //var etxt = JSON.stringify(e);
                console.log("Err running macro. err:", e);
                var etxt = e.message;
                var estack = null;
                if ('stack' in e) estack = e.stack;
                if (etxt != null && etxt.length > 0) {
                    this.status("Error doing eval() on your script. Error: " + etxt );
                    if (estack != null) this.status(estack);
                } else {
                    this.status("Error doing eval() on your script.");
                }
            }
            } else {
                this.status("No script to run. Empty.");
            }
        },
        jscriptKeypress: function(evt) {
            //console.log("got keypress textarea. evt:", evt);
            if (evt.ctrlKey && evt.keyCode == 10) {
                // run the macro
                //$('.com-chilipeppr-widget-macro-run').click();
                this.runMacro();
                // mimic push on btn
                $('.com-chilipeppr-widget-macro-run').addClass('active');
                setTimeout(function() {
                    $('.com-chilipeppr-widget-macro-run').removeClass('active');
                }, 200);
            }
                
        },
        showData: function(datatxt) {
            $('#com-chilipeppr-widget-modal-macro-view .modal-body textarea').val(datatxt);
            //$('#com-chilipeppr-widget-modal-macro-view .modal-title').text("View Probe Data");
            $('#com-chilipeppr-widget-modal-macro-view').modal('show');
        },
        saveMacro: function() {
            
            var fileStr = this.getJscript();
            var firstLine = "";
            if (fileStr.match(/(.*)\r{0,1}\n/)) {
                // we have our first line
                firstLine = RegExp.$1;
            } else if (fileStr.length > 20) {
                firstLine = fileStr.substring(0,20);
            } else if (fileStr.length > 0) {
                firstLine = fileStr;
            }
                
            var info = {
                name: "Macro " + firstLine,
                lastModified: new Date()
            };
            this.createRecentFileEntry(fileStr, info);
            this.status('Saved your file "' + info.name + '". Retrieve it from upper right pulldown.');

        },
        deleteRecentFiles: function() {
            console.log("deleting files");
            // loop thru file storage and delete entries that match this widget
            var keysToDelete = [];
            for (var i = 0; i < localStorage.length; i++){
                console.log("localStorage.item.key:", localStorage.key(i));
                var key = localStorage.key(i);
                if (key.match(/com-chilipeppr-widget-macro-recent/)) {
                    //localStorage.removeItem(key);
                    keysToDelete.push(key);
                    console.log("going to remove localstorage key:", key);
                }
            }
            keysToDelete.forEach(function(key) {
                localStorage.removeItem(key);
            });
            //localStorage.clear();
            this.buildRecentFileMenu();
        },
        createRecentFileEntry: function(fileStr, info) {
            console.log("createRecentFileEntry. fileStr.length:", fileStr.length, "info:", info);
            // get the next avail slot
            var lastSlot = -1;
            for(var ctr = 0; ctr < 100; ctr++) {
                if ('com-chilipeppr-widget-macro-recent' + ctr in localStorage) {
                    console.log("found recent file entry. ctr:", ctr);
                    lastSlot = ctr;
                }
            }
            console.log("lastSlot we found:", lastSlot);
            
            var nextSlot = lastSlot + 1;
            var recent = localStorage.getItem("com-chilipeppr-widget-macro-recent" + nextSlot);
            if (recent == null) {
                console.log("empty slot. filling.");
                localStorage.setItem("com-chilipeppr-widget-macro-recent" + nextSlot, fileStr);
                localStorage.setItem("com-chilipeppr-widget-macro-recent" + nextSlot + "-name", info.name);
                localStorage.setItem("com-chilipeppr-widget-macro-recent" + nextSlot + "-lastMod", info.lastModified);
                this.buildRecentFileMenu();
            }
            
        },
        buildRecentFileMenu: function() {
            
            // cleanup prev recent files
            $('#com-chilipeppr-widget-macro .dropdown-menu-main > li.recent-file-item').remove();
            
            var li = $('#com-chilipeppr-widget-macro .dropdown-menu-main > li.recent-files');
            console.log("listItems:", li);
            
            // get all macro files
            var keysForMacros = [];
            for (var i = 0; i < localStorage.length; i++){
                console.log("localStorage.item.key:", localStorage.key(i));
                var key = localStorage.key(i);
                if (key.match(/com-chilipeppr-widget-macro-recent(\d+)-name/)) {
                    //localStorage.removeItem(key);
                    var keyCtr = RegExp.$1;
                    keysForMacros.push(keyCtr);
                    console.log("found a macro name with localstorage key:", key, "keyCtr:", keyCtr);
                }
            }
            keysForMacros.forEach(function(key) {
                localStorage.removeItem(key);
            });
            
            //var ctr = 0;
            for(var i = 0; i < keysForMacros.length; i++) {
                var ctr = keysForMacros[i];
                var recentName = localStorage.getItem("com-chilipeppr-widget-macro-recent" + ctr + "-name");
                //while(recentName != null) {
                console.log("recentFile ctr:", ctr, "recentName:", recentName);
                var recentLastModified = localStorage.getItem("com-chilipeppr-widget-macro-recent" + ctr + "-lastMod");
                var rlm = new Date(recentLastModified);
                var recentSize = localStorage.getItem("com-chilipeppr-widget-macro-recent" + ctr).length;
                var rsize = parseInt(recentSize / 1024);
                if (rsize == 0) rsize = 1;
                var newLi = $(
                    '<li class="recent-file-item"><a href="javascript:">' + recentName +
                    ' <span class="lastModifyDate">' + rlm.toLocaleString() + '</span>' +
                    ' ' + rsize + 'KB' +
                    '</a></li>');
                    //' <button type="button" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-trash"></span></button></a></li>');
                newLi.insertAfter(li);
                var that = this;
                newLi.click("com-chilipeppr-widget-macro-recent" + ctr, function(data) {
                    console.log("got recent file click. data:", data);
                    var key = data.data;
                    that.loadFileFromLocalStorageKey(key);
                    
                });

                //ctr++;
                //recentName = localStorage.getItem("com-chilipeppr-widget-macro-recent" + ctr + "-name");
                
            }
        },
        loadFileFromLocalStorageKey: function(key) {
            // load file into probes
            var info = {
                name: localStorage.getItem(key + '-name'), 
                lastModified: localStorage.getItem(key + '-lastMod')
            };
            console.log("loading macro data. localStorage.key:", key, "info:", info);
            
            // load the data
            this.jscript = localStorage.getItem(key);
            this.loadJscript(this.jscript);
            this.status("Loaded data \"" + info.name + "\"");
        },
        loadJscript: function(txt) {
            //this.jscript = txt;
            $('.com-chilipeppr-widget-macro-jscript').val(txt);
            console.log("loaded jscript");
        },
        setupSamples: function() {
            var that = this;
            $('.com-chilipeppr-widget-macro-sample.sample-alert').click(function() { 
                that.loadJscript('alert("Ahhh. Something went wrong!");');
            });
            $('.com-chilipeppr-widget-macro-sample.sample-status').click(function() { 
                that.loadJscript('macro.status("I just put a status item entry in.");');
            });
            $('.com-chilipeppr-widget-macro-sample.sample-send').click(function() { 
                that.loadJscript('macro.sendSerial("?\\n");');
            });
            $('.com-chilipeppr-widget-macro-sample.sample-sendpub').click(function() { 
                that.loadJscript(
                    '// Uses the official pubsub method\n' +
                    '// to send to serial port when serial\n' + 
                    '// port widget is in single select mode\n' + 
                    'chilipeppr.publish("/com-chilipeppr-widget-serialport/send", "G1 X10 F500\\n");'
                );
            });

            $('.com-chilipeppr-widget-macro-sample.sample-sendgcode').click(function() { 
                that.loadJscript('macro.sendSerial("G0 X0 Y0\\n");');
            });
            
            $('.com-chilipeppr-widget-macro-sample.sample-sendaltport').click(function() { 
                var txt = that.getMethodString(that.sendToArduino);
                that.loadJscript(txt);
            });
            
            $('.com-chilipeppr-widget-macro-sample.sample-watch').click(function() { 
                //var txt = that.watch.toString();
                var txt = that.getMethodString(that.watch);
                //console.log("watch jscript:", txt, "that.watch:", that.watch);
                that.loadJscript(txt);
            });

            $('.com-chilipeppr-widget-macro-sample.sample-loadgcode').click(function() { 
                //var txt = that.watch.toString();
                var txt = that.getMethodString(that.sendGcodeToWorkspace);
                //console.log("watch jscript:", txt, "that.watch:", that.watch);
                that.loadJscript(txt);
            });
            
            $('.com-chilipeppr-widget-macro-sample.sample-fadeout').click(function() { 
                var txt = that.getMethodString(that.fadeout);
                that.loadJscript(txt);
            });
            
            //bbox
            $('.com-chilipeppr-widget-macro-sample.sample-bbox').click(function() { 
                var txt = that.getMethodString(that.addbbox);
                that.loadJscript(txt);
            });
            
            // list of gcode cmds
             $('.com-chilipeppr-widget-macro-sample.sample-loopcmds').click(function() { 
                var txt = that.getMethodString(that.cmdsSentViaTimeout);
                that.loadJscript(txt);
            });
            
            // downloadgcode
            $('.com-chilipeppr-widget-macro-sample.sample-downloadgcode').click(function() { 
                var txt = that.getMethodString(that.downloadGcode);
                that.loadJscript(txt);
            });
            
            // injectCams
            $('.com-chilipeppr-widget-macro-sample.sample-injectCams').click(function() { 
                var txt = that.getMethodString(that.injectCams);
                that.loadJscript(txt);
            });
            
            // iterateGcode
            $('.com-chilipeppr-widget-macro-sample.sample-iterateGcode').click(function() { 
                var txt = that.getMethodString(that.iterateGcode);
                that.loadJscript(txt);
            });
            
            // watchOnComplete
            $('.com-chilipeppr-widget-macro-sample.sample-watchOnComplete').click(function() { 
                var txt = that.getMethodString(that.watchOnCompleteControlArduino);
                that.loadJscript(txt);
            });
            
            // rewriteGcode
            $('.com-chilipeppr-widget-macro-sample.sample-rewritegcode').click(function() { 
                var txt = that.getMethodString(that.rewriteGcode);
                that.loadJscript(txt);
            });
            
            // injectBtn
            $('.com-chilipeppr-widget-macro-sample.sample-injectbtn').click(function() { 
                var txt = that.getMethodString(that.injectBtn);
                that.loadJscript(txt);
            });
            
            // get3dobj
            $('.com-chilipeppr-widget-macro-sample.sample-get3dobj').click(function() { 
                var txt = that.getMethodString(that.get3dobj);
                that.loadJscript(txt);
            });
            
            // get3dobjG1FromG2G3
            $('.com-chilipeppr-widget-macro-sample.sample-get3dobjG1FromG2G3').click(function() { 
                var txt = that.getMethodString(that.get3dobjG1FromG2G3);
                that.loadJscript(txt);
            });
            
            // flashMsg
            $('.com-chilipeppr-widget-macro-sample.sample-flashMsg').click(function() { 
                var txt = that.getMethodString(that.flashMsg);
                that.loadJscript(txt);
            });
            
            // watchChiliPepprPause
            $('.com-chilipeppr-widget-macro-sample.sample-watchChiliPepprPause').click(function() { 
                var txt = that.getMethodString(that.watchChiliPepprPause);
                that.loadJscript(txt);
            });
            
            // watchChiliPepprPauseSolderDispenser
            $('.com-chilipeppr-widget-macro-sample.sample-watchChiliPepprPauseSolderDispenser').click(function() { 
                var txt = that.getMethodString(that.watchChiliPepprPauseSolderDispenser);
                that.loadJscript(txt);
            });
            
            // append the autoAddMacros
            var dropdownEl = $('#' + this.id + ' .dropdown-sample-macros');
            console.log("dropdown to append to", dropdownEl);
            for (var i in this.autoAddMacros) {
                var item = this.autoAddMacros[i];
                var id = item.id;
                var desc = item.desc;

                var menuToAdd = $('<li><a href="javascript:" class="com-chilipeppr-widget-macro-sample ' +
                    'sample-' + id + '">' + desc + '</a></li>');
                menuToAdd.click({id:id}, function(evt) {
                    console.log("evt.data:", evt.data);
                    var txt = that.getMethodString(that[evt.data.id]);
                    that.loadJscript(txt);
                });
            
                console.log("adding macro id:", id, "desc:", desc, "el:", menuToAdd);
                 
                // append to menu
                dropdownEl.append(menuToAdd);
                console.log("the new dropdown:", dropdownEl);
            }
                        
            
        },
        getMethodString: function(methodToGet) {
            var txt = methodToGet.toString();
            // remove first and last lines
            var arr = txt.split("\n");
            var ctr = 0;
            arr.forEach(function(item) {
                arr[ctr] = item.replace(/            /, "");
                arr[ctr] = arr[ctr].replace(/    /g, "\t");
                ctr++;
            });
            arr = arr.splice(1, arr.length - 2);
            return arr.join("\n");
        },
        autoAddMacros: [
            { id : 'generateZigZag', desc : "Generate Zig Zag Tool Path" },
            { id : 'makeFeedholdBtnHuge', desc : "Make Feedhold Button Huge" },
            { id : 'turnOffAllPopovers', desc : "Turn Off All Popovers" },
            { id : 'makeAllButtonsBig', desc : "Make All Buttons Big" },
        ],

        // START SAMPLES
        /**
         * This macro helps you generate a zig zag tool
         * path inside of an overall rectangular shape. 
         * Give it the width and height of the rectangular
         * shape. Then give it the step over value and it 
         * will generate the gcode and then send it to the 
         * workspace so you can visualize it and run it.
         * 
         * This can be used to mill out or pocket a work
         * piece. It can also be used to scan a laser
         * over a surface to ablate or cure material
         * by scanning back and forth with a step over.
         */
        makeFeedholdBtnHuge: function() {
            var btn = $('.tinyg-feedhold')
            btn.removeClass('btn-xs');
            var parent = btn.parent();
            btn.detach();
            btn.prependTo(parent.parent().parent());
            btn.attr('style', 'width:100%;margin-bottom:10px;');
        },
        turnOffAllPopovers: function() {
            $('[data-toggle="popover"]').popover('destroy');
            $('[data-trigger="hover"]').popover('destroy');
        },
        makeAllButtonsBig: function() {
            $('.btn').removeClass('btn-xs');
        },
        generateZigZag: function() {
            /**
             * This macro helps you generate a zig zag tool
             * path inside of an overall rectangular shape. 
             * Give it the width and height of the rectangular
             * shape. Then give it the step over value and it 
             * will generate the gcode and then send it to the 
             * workspace so you can visualize it and run it.
             * 
             * This can be used to mill out or pocket a work
             * piece. It can also be used to scan a laser
             * over a surface to ablate or cure material
             * by scanning back and forth with a step over.
             */
            window = {};
            var generateZigZag = {
                units: "mm", // or "inch"
                width: 1.5,
                height: 2,
                stepover: 0.1,
                /**
                 * If we step over on x, then we are scanning
                 * the y from bottom to top, then stepping over
                 * on x, then scanning y top to bottom. If
                 * we step over on y, then we are scanning
                 * from left to right on x, stepping up on y
                 * then scanning from right to left.
                 */
                stepdirection: "x", // or "y"
                feedrate: 100,
                init: function() {
                    // Uninit previous runs so that any permanent
                    // in-memory stuff we do can be removed without
                    // have to reload the browser
                    if (window["generateZigZag"]) {
                        macro.status("This macro was run before. Cleaning up...");
                        window["generateZigZag"].uninit();
                    }
                    macro.status("Initting...");
    
                    // store macro in window object so we have it next time thru
                    window["generateZigZag"] = this;
                },
                uninit: function() {
                    macro.status("Uninitting...");
                },
                createToolPath: function(options) {
    
                    // See if user wants to override defaults
                    if (!options) options = {}
                    if (!options.units) options.units = this.units;
                    if (!options.width) options.width = this.width;
                    if (!options.height) options.height = this.height;
                    if (!options.stepover) options.stepover = this.stepover;
                    if (!options.stepdirection) options.stepdirection = this.stepdirection;
                    if (!options.feedrate) options.feedrate = this.feedrate;
    
                    this.lastOptions = options;
    
                    var cmds = ['G0 X0 Y0', 'G1 F' + options.feedrate];
    
                    if (options.stepdirection == "x") {
                        var isAtTop = false;
                        for (var x = 0; x <= options.width; x += options.stepover) {
                            cmds.push("G1 X" + x);
                            if (isAtTop) {
                                cmds.push("G1 Y0");
                                isAtTop = false;
                            }
                            else {
                                cmds.push("G1 Y" + options.height);
                                isAtTop = true;
                            }
                        }
                    }
                    else {
                        var isAtRight = false;
                        for (var y = 0; y <= options.height; y += options.stepover) {
                            cmds.push("G1 Y" + y);
                            if (isAtRight) {
                                cmds.push("G1 X0");
                                isAtRight = false;
                            }
                            else {
                                cmds.push("G1 X" + options.width);
                                isAtRight = true;
                            }
                        }
    
                    }
    
                    // trace
                    cmds.push("G0 X0 Y0");
                    cmds.push("G1 X" + options.width);
                    cmds.push("Y" + options.height);
                    cmds.push("X0");
                    cmds.push("Y0");
    
                    return cmds.join("\n");
                },
                sendGcodeToWorkspace: function(gcodetext) {
                    var info = {
                        name: "Zig Zag",
                        lastModified: new Date()
                    };
                    if (this.lastOptions) info.name += " w:" + this.lastOptions.width + " h:" + this.lastOptions.height + " so:" + this.lastOptions.stepover;
                    // send event off as if the file was drag/dropped
                    chilipeppr.publish("/com-chilipeppr-elem-dragdrop/ondropped", gcodetext, info);
                }
            }
            generateZigZag.init();
            var gcode = "(My zig zag for SMD pad)\nG21\n";
            gcode += generateZigZag.createToolPath();
            gcode += "\nG0 X0 Y0 Z0.1\n";
            gcode += generateZigZag.createToolPath({
                stepdirection: "y"
            });
            generateZigZag.sendGcodeToWorkspace(gcode);
        },
        /**
         *  This macro shows how to watch for the chilipeppr
            pause sync event that is triggered if you include
            a comment in your gcode file like 
            (chilipeppr_pause) or ; chilipeppr_pause
            And then it sends commands to a 2nd CNC controller
            to actually dispense solder paste
            
            Here is a sample gcode file that uses chilipeppr_pause
            <pre>G0 X0 Y0 Z0<br>
            F50<br>
            G1 X10<br>
            (chilipeppr_pause trigger laser on)<br>
            G1 X20<br>
            (chilipeppr_pause trigger laser off)<br>
            G0 X0</pre>
            */
        watchChiliPepprPauseSolderDispenser: function() {
            // This macro shows how to watch for the chilipeppr
            // pause sync event that is triggered if you include
            // a comment in your gcode file like 
            // (chilipeppr_pause) or ; chilipeppr_pause
            // And then it sends commands to a 2nd CNC controller
            // to actually dispense solder paste
            //
            // Here is a sample gcode file that uses chilipeppr_pause
            /*
            G0 X0 Y0 Z0
            F50
            G1 X10
            (chilipeppr_pause trigger laser on)
            G1 X20
            (chilipeppr_pause trigger laser off)
            G0 X0
            */
            var myWatchChiliPepprPause = {
                serialPort: "/dev/ttyUSB0",
                init: function() {
                    // Uninit previous runs to unsubscribe correctly, i.e.
                    // so we don't subscribe 100's of times each time we modify
                    // and run this macro
                    if (window["myWatchChiliPepprPause"]) {
                        macro.status("This macro was run before. Cleaning up...");
                        window["myWatchChiliPepprPause"].uninit();
                    }
                    macro.status("Subscribing to chilipeppr_pause pubsub event");
                    
                    // store macro in window object so we have it next time thru
                    window["myWatchChiliPepprPause"] = this;
                    
                    this.setupSubscribe();
                    
                    //this.openPort();
                    
                    chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "Initting Example of Solder Paste Dispenser", "Shows how to use chilipeppr_pause Gcode command and 2nd CNC controller");
                },
                uninit: function() {
                    macro.status("Uninitting chilipeppr_pause macro.");
                    this.unsetupSubscribe();
                },
                setupSubscribe: function() {
                    // Subscribe to both events because you will not
                    // get onComplete if the controller is sophisticated
                    // enough to send onExecute, i.e. TinyG will only
                    // get onExecute events while Grbl will only get
                    // onComplete events
                    chilipeppr.subscribe("/com-chilipeppr-widget-gcode/onChiliPepprPauseOnExecute", this, this.onChiliPepprPauseOnExecute);
                    chilipeppr.subscribe("/com-chilipeppr-widget-gcode/onChiliPepprPauseOnComplete", this, this.onChiliPepprPauseOnComplete);
                },
                unsetupSubscribe: function() {
                    chilipeppr.unsubscribe("/com-chilipeppr-widget-gcode/onChiliPepprPauseOnExecute", this.onChiliPepprPauseOnExecute);
                    chilipeppr.unsubscribe("/com-chilipeppr-widget-gcode/onChiliPepprPauseOnComplete", this.onChiliPepprPauseOnComplete);
                },
                onChiliPepprPauseOnExecute: function(data) {
                    macro.status("Got onChiliPepprPauseOnExecute. Will unpause in 10 seconds.");
                    console.log("got onChiliPepprPauseOnExecute. data:", data);
                    //chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "Time to sync", "Pretend we are sending a command to our solder paste dispenser to do its thing and then we will unpause our main Gcode file.", 4000);
                    
                    this.dispense();
                    setTimeout(this.unpauseGcode, 1000);
                },
                onChiliPepprPauseOnComplete: function(data) {
                    macro.status("Got onChiliPepprPauseOnComplete. Will unpause in 10 seconds.");
                    console.log("got onChiliPepprPauseOnComplete. data:", data);
                    //chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "Time to sync", "Pretend we are sending a command to our solder paste dispenser to do its thing and then we will unpause our main Gcode file.", 14000);
                    
                    setTimeout(this.dispense.bind(this), 3000);
                    
                    // since we'll get this onComplete way ahead of moves,
                    // wait WAYYY longer than onExecute
                    setTimeout(this.unpauseGcode, 5000);
                },
                unpauseGcode: function() {
                    macro.status("Just unpaused gcode.");
                    chilipeppr.publish("/com-chilipeppr-widget-gcode/pause", "");
                },
                ctr: 0,
                dispense: function() {

                    this.ctr++;
                    macro.status("Dispensing drop " + this.ctr);
                    var cmd = "sendjson "; // + this.serialPort + " ";
                    var payload = {
                        P: this.serialPort,
                        Data: [
                            {
                                D: "G91\n",
                                Id: "dispenseRelCoords" + this.ctr
                            },
                            {
                                D: "G1 F200 X1.5\n",
                                Id: "dispense" + this.ctr
                            }

                        ]
                    };
                    cmd += JSON.stringify(payload) + "\n";
                    chilipeppr.publish("/com-chilipeppr-widget-serialport/ws/send", cmd);

                },
                openPort: function() {
                                        
                    chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "Opening serial port", "We are ensuring the port " + this.serialPort + " is open so we can write to it.", 3000);

                    var cmd = "open " + this.serialPort + " 115200 tinyg";
                    cmd += "\n";
                    chilipeppr.publish("/com-chilipeppr-widget-serialport/ws/send", cmd);

                }
            }
            myWatchChiliPepprPause.init();
        },
        /**
        * This macro shows how to watch for the chilipeppr
        pause sync event that is triggered if you include
        a comment in your gcode file like 
        (chilipeppr_pause) or ; chilipeppr_pause
        
        Here is a sample gcode file that uses chilipeppr_pause
        <pre>G0 X0 Y0 Z0<br>
        F50<br>
        G1 X10<br>
        (chilipeppr_pause trigger laser on)<br>
        G1 X20<br>
        (chilipeppr_pause trigger laser off)<br>
        G0 X0</pre>
         */
        watchChiliPepprPause: function() {
            // This macro shows how to watch for the chilipeppr
            // pause sync event that is triggered if you include
            // a comment in your gcode file like 
            // (chilipeppr_pause) or ; chilipeppr_pause
            //
            // Here is a sample gcode file that uses chilipeppr_pause
            /*
            G0 X0 Y0 Z0
            F50
            G1 X10
            (chilipeppr_pause trigger laser on)
            G1 X20
            (chilipeppr_pause trigger laser off)
            G0 X0
            */
            var myWatchChiliPepprPause = {
                init: function() {
                    // Uninit previous runs to unsubscribe correctly, i.e.
                    // so we don't subscribe 100's of times each time we modify
                    // and run this macro
                    if (window["myWatchChiliPepprPause"]) {
                        macro.status("This macro was run before. Cleaning up...");
                        window["myWatchChiliPepprPause"].uninit();
                    }
                    macro.status("Subscribing to chilipeppr_pause pubsub event");
                    
                    // store macro in window object so we have it next time thru
                    window["myWatchChiliPepprPause"] = this;
                    
                    this.setupSubscribe();
                },
                uninit: function() {
                    macro.status("Uninitting chilipeppr_pause macro.");
                    this.unsetupSubscribe();
                },
                setupSubscribe: function() {
                    // Subscribe to both events because you will not
                    // get onComplete if the controller is sophisticated
                    // enough to send onExecute, i.e. TinyG will only
                    // get onExecute events while Grbl will only get
                    // onComplete events
                    chilipeppr.subscribe("/com-chilipeppr-widget-gcode/onChiliPepprPauseOnExecute", this, this.onChiliPepprPauseOnExecute);
                    chilipeppr.subscribe("/com-chilipeppr-widget-gcode/onChiliPepprPauseOnComplete", this, this.onChiliPepprPauseOnComplete);
                },
                unsetupSubscribe: function() {
                    chilipeppr.unsubscribe("/com-chilipeppr-widget-gcode/onChiliPepprPauseOnExecute", this.onChiliPepprPauseOnExecute);
                    chilipeppr.unsubscribe("/com-chilipeppr-widget-gcode/onChiliPepprPauseOnComplete", this.onChiliPepprPauseOnComplete);
                },
                onChiliPepprPauseOnExecute: function(data) {
                    macro.status("Got onChiliPepprPauseOnExecute. Will unpause in 10 seconds.");
                    console.log("got onChiliPepprPauseOnExecute. data:", data);
                    chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "Time to sync", "Pretend we are sending a command to our solder paste dispenser to do its thing and then we will unpause our main Gcode file.", 9000);
                    setTimeout(this.unpauseGcode, 10000);
                },
                onChiliPepprPauseOnComplete: function(data) {
                    macro.status("Got onChiliPepprPauseOnComplete. Will unpause in 10 seconds.");
                    console.log("got onChiliPepprPauseOnComplete. data:", data);
                    chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "Time to sync", "Pretend we are sending a command to our solder paste dispenser to do its thing and then we will unpause our main Gcode file.", 9000);
                    setTimeout(this.unpauseGcode, 10000);
                },
                unpauseGcode: function() {
                    macro.status("Just unpaused gcode.");
                    chilipeppr.publish("/com-chilipeppr-widget-gcode/pause", "");
                }
            }
            myWatchChiliPepprPause.init();
        },
        /**
         * Shows how to generate a Flash Message inside ChiliPeppr, which is
         * a message that shows by default for 3 seconds on top of everything
         * and then fades out. It's a great way to get the user's attention
         * without you having to write more than one line of code.
         */
        flashMsg: function() {
            chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "My title", "My body");
            chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "My title", "Only show for 1 second", 1000);
        },
        /**
         * Get the object that represents the 3D viewer. Once you have it, you
         * can put anything into the 3D viewer that you'd like. You can wipe
         * out the scene, or add to it, or adjust the properties. ChiliPeppr
         * uses Three.js so you can refer to the docs for Three.js to figure
         * out different techniques for manipulating things.
         */
        get3dobj: function() {
            var get3dObj= function() {
                chilipeppr.subscribe("/com-chilipeppr-widget-3dviewer/recv3dObject", recv3dObj);
                chilipeppr.publish("/com-chilipeppr-widget-3dviewer/request3dObject", "");
                chilipeppr.unsubscribe("/com-chilipeppr-widget-3dviewer/recv3dObject", recv3dObj);
            };
            
            var recv3dObj = function(obj) {
                console.log("got 3d obj:", obj);
                macro.status("got 3d obj");
            }
            
            get3dObj();

        },
        /**
         * Convert G2/G3 arcs to G1 moves. If you are having problems with your
         * CNC controller converting arcs, you could actually rewrite your Gcode
         * to straight line moves (G1's) with this macro. Each arc gets turned
         * into 24 line segments.
         */
        get3dobjG1FromG2G3: function() {
            var get3dObj= function() {
                chilipeppr.subscribe("/com-chilipeppr-widget-3dviewer/recv3dObject", recv3dObj);
                chilipeppr.publish("/com-chilipeppr-widget-3dviewer/request3dObject", "");
                chilipeppr.unsubscribe("/com-chilipeppr-widget-3dviewer/recv3dObject", recv3dObj);
            };
            
            var recv3dObj = function(obj) {
                console.log("got 3d obj:", obj);
                // Get Gcode lines from 3dObj
                var gcodelines = obj.userData.lines;
                // Loop thru lines to see if there are G2 or G3's
                for (var i = 0; i < gcodelines .length; i++) {
                    var line = gcodelines[i];
                    if (line.p2 && line.p2.arc) {
                        console.log("the G1 version of the G2/G3 arc for gcode line:", i, line.p2.threeObjArc.geometry.vertices);
                    }
                }
                macro.status("got 3d obj");
            }

            get3dObj();
        },
        injectBtn: function() {
            // This macro shows how to inject a button into the macro
            // toolbar for use inside your macro.
            var myMacroBtns = {
                init: function() {
                    // Uninit previous runs to unsubscribe correctly, i.e.
                    // so we don't subscribe 100's of times each time we modify
                    // and run this macro
                    if (window["myMacroBtns"]) {
                        macro.status("This macro was run before. Cleaning up...");
                        window["myMacroBtns"].uninit();
                    }
                    macro.status("Adding buttons to macro toolbar");
                    
                    // store macro in window object so we have it next time thru
                    window["myMacroBtns"] = this;
                    
                    this.addBtns();
                },
                uninit: function() {
                    macro.status("Uninitting macro.");
                    this.removeBtns();
                },
                addBtns: function() {
                    var btnGrp = $('<div class="btn-group pull-right mymacrobtns" style="margin-right:6px;"></div>');
                    var btn1 = $('<button type="button" class="btn btn-xs btn-default mymacro-btn1">1</button>');
                    btn1.click(this.onBtn1Click.bind(this));
                    var btn2 = $('<button type="button" class="btn btn-xs btn-default mymacro-btn2">2</button>');
                    btn2.click(this.onBtn2Click.bind(this));
                    btnGrp.append(btn1);
                    btnGrp.append(btn2);
                    $('#com-chilipeppr-widget-macro .panel-heading').append(btnGrp);
                },
                removeBtns: function() {
                    $('#com-chilipeppr-widget-macro .panel-heading .mymacrobtns').remove();
                },
                onBtn1Click: function(evt) {
                    macro.status("Button 1 clicked.");
                },
                onBtn2Click: function(evt) {
                    macro.status("Button 2 clicked.");
                }
            }
            myMacroBtns.init();
        },
        rewriteGcode: function() {
            // Rewrite g-code on-the-fly to 4-axis pulley system as it's
            // sent to the CNC controller. This means the XYZ values are
            // translated from their coordinates on each line of Gcode via
            // the pythagorean formula to pulley string lengths.
            //
            // This macro shows how to intercept the gcode as it's sent,
            // cancel the send, rewrite it to new gcode, and then resend.
            // The intercepting capabilities are due to the loosely coupled
            // design of ChiliPeppr where all widget interaction is done via
            // pubsub, thus giving you control to intercept or listen in on
            // the signals.
            //
            // This macro also shows how to use the 3D viewer XYZ values
            // translated from the original Gcode to know an exact XYZ
            // value for each line of Gcode.
            
            var myMacro = {
                init: function() {
                    // Uninit previous runs to unsubscribe correctly, i.e.
                    // so we don't subscribe 100's of times each time we modify
                    // and run this macro
                    if (window["myMacro"]) {
                        macro.status("This macro was run before. Cleaning up...");
                        window["myMacro"].uninit();
                    }
                    macro.status("Starting watch on pulley rewrite macro");
                    // subscribe to JSON send at a higher priority than the default
                    // so we can intercept these pubsub's before they go to the TinyG
                    // cuz we're going to rewrite them
                    // The 5 at the end of the subscribe() is the priority.
                    // The default priority of a subscribe() is 10. Lower is
                    // higher priority.
                    chilipeppr.subscribe('/com-chilipeppr-widget-serialport/jsonSend', this, this.onJsonSend, 5);
                    // store macro in window object so we have it next time thru
                    window["myMacro"] = this;
                    
                    // get 3d coordinates by asking the 3d viewer to give them to us 
                    // we'll get this.obj3d set for us so we can use it later
                    this.getXyzCoords();
                },
                uninit: function() {
                    macro.status("Uninitting macro.");
                    chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/jsonSend", this.onJsonSend);
                },
                onJsonSend: function(data) {
                    console.group('pulley rewrite'); 
                    console.log(data);
                    
                    // if the data is an array, then return immediately because we only want to do a rewrite
                    // when jsonSend is individual lines, not when its a multiline array object.
                    // this might seem odd why, but chilipeppr sends lines individually at first and does
                    // it's own ganging up if user picked "multi-line" mode, so let's not rewrite stuff
                    // over and over. just know that if you look for a single line you're safe.
                    if (Array.isArray(data)) {
                        console.log("data was an array, so returning immediately cuz don't want to modify arrays of jsonData");
                        console.groupEnd();
                        return;
                    }
                    
                    // extract the line from the ID which is of the form "g45" for line 45
                    var line = parseInt(data.Id.replace(/g/, ""));
                    
                    // get xyz coords and cleaned up meta data for gcode from the 3d viewer parsed data
                    var coord = this.getXyzCoordsForLine(line);
                    console.log("xyz coords for line:", line, coord);
                    
                    // check if we have a cmd and if it is a G0 or G1, otherwise return
                    if ('cmd' in coord.meta.args && coord.meta.args.cmd.match(/g1|g0/i)) {
                        console.log("this is a command we want to process. good.");
                    } else {
                        console.log("This gcode line did not contain a G0 or G1 command, so not rewriting");
                        console.groupEnd();
                        return;
                    }
                    
                    var cmd = coord.meta.args.cmd;
                    
                    // get simple vars for xyz
                    var x = coord.end.x;
                    var y = coord.end.y;
                    var z = coord.end.z;
                    
                    //var x = 6;
                    //var y = 2;
                    //var z = 3;
                    
                    // what are the positions of each corner for the pulleys so we can calc
                    var fl_pos = {x:0,y:0,z:10};
                    var bl_pos = {x:0,y:10,z:10};
                    var br_pos = {x:10,y:10,z:10};
                    var fr_pos = {x:10,y:0,z:10};
                    
                    // convert XYZ cartesion coordinates to XYZA (fl,bl,br,fr) pulley lengths
                    // fl=front left, bl=back left, br=back right, fr=front right
                    // Find hypotenuse length for fl,bl,br,fr in xy plane
                    var fl_xy_hyp = Math.sqrt((x * x) + (y * y));
                    var bl_xy_hyp = Math.sqrt((x * x) + ((bl_pos.y - y) * (bl_pos.y - y)));
                    var br_xy_hyp = Math.sqrt(((br_pos.x - x) * (br_pos.x - x)) + ((br_pos.y - y) * (br_pos.y - y)));
                    var fr_xy_hyp = Math.sqrt(((fr_pos.x - x) * (fr_pos.x - x)) + (Math.abs(fr_pos.y - y) * Math.abs(fr_pos.y - y)));
                    
                    // Find hypotenuse length for z plane 
                    var fl_hyp = Math.sqrt((fl_xy_hyp * fl_xy_hyp) + ((fl_pos.z - z) * (fl_pos.z - z)));
                    var bl_hyp = Math.sqrt((bl_xy_hyp * bl_xy_hyp) + ((bl_pos.z - z) * (bl_pos.z - z)));
                    var br_hyp = Math.sqrt((br_xy_hyp * br_xy_hyp) + ((br_pos.z - z) * (br_pos.z - z)));
                    var fr_hyp = Math.sqrt((fr_xy_hyp * fr_xy_hyp) + ((fr_pos.z - z) * (fr_pos.z - z)));
                    
                    console.log("Pulley len FL:", fl_hyp, "len BL:", bl_hyp, "len BR:", br_hyp, "len FR:", fr_hyp);
                    
                    var gcode = cmd + " X" + fl_hyp + " Y" + bl_hyp + " Z" + br_hyp + " A" + fr_hyp;
                    console.log("Final gcode:", gcode);
                    
                    // see if there was a feedrate
                    if ('f' in coord.meta.args) {
                        console.log("there was a feedrate:", coord.meta.args.f);
                        gcode += " F" + coord.meta.args.f;
                    }
                    gcode += "\n";
                    
                    //republish the gcode command that was intercepted
                    var obj = {D: gcode, Id: data.Id};
                    // unsubscribe so that we don't get our own rewritten gcode coming back to us
                    chilipeppr.unsubscribe('/com-chilipeppr-widget-serialport/jsonSend', this.onJsonSend); 
                    // send the gcode off as if nothing really changed, even tho we completely rewrote it
                    chilipeppr.publish('/com-chilipeppr-widget-serialport/jsonSend', obj);
                    // resubscribe immediately so we can rewrite the next line of gcode
                    chilipeppr.subscribe('/com-chilipeppr-widget-serialport/jsonSend', this, this.onJsonSend, 5);
                    
                    console.groupEnd();
                    return false;
                },
                obj3d: null,
                getXyzCoords: function() {
                    chilipeppr.subscribe("/com-chilipeppr-widget-3dviewer/recv3dObject", this, this.getXyzCoordsRecv3dObj);
                    chilipeppr.publish("/com-chilipeppr-widget-3dviewer/request3dObject", "");
                },
                getXyzCoordsRecv3dObj: function(obj3d) {
                    console.log("Got our 3d obj. Line count:", obj3d.userData.lines.length);
                    this.obj3d = obj3d;
                    // unsub so we don't get anymore callbacks on this
                    chilipeppr.unsubscribe("/com-chilipeppr-widget-3dviewer/recv3dObject", this.getXyzCoordsRecv3dObj);
                },
                getXyzCoordsForLine: function(line) {
                    console.log("getXyzCoordsForLine. line:", line);
                    var ret = { 
                        start: {
                            index: null, x: null, y: null, z: null
                        },
                        end: {
                            index: null, x: null, y: null, z: null
                        },
                        meta: null
                    };
                    var indx = line - 2;
                    if (indx < 0) indx = 0;
                    ret.start.index = indx;
                    ret.start.x = this.obj3d.userData.lines[indx].p2.x;
                    ret.start.y = this.obj3d.userData.lines[indx].p2.y;
                    ret.start.z = this.obj3d.userData.lines[indx].p2.z;
                    indx = line - 1;
                    ret.end.index = indx;
                    ret.end.x = this.obj3d.userData.lines[indx].p2.x;
                    ret.end.y = this.obj3d.userData.lines[indx].p2.y;
                    ret.end.z = this.obj3d.userData.lines[indx].p2.z;
                    ret.meta = this.obj3d.userData.lines[indx];
                    return ret;
                }
            }
            myMacro.init();
        },
        watchOnCompleteControlArduino: function() {
            // Watch onComplete and Fire Laser
            var myMacro = {
                gcode: null, // holds our gcode
                arduinoSerialPort: "COM37", // we send laser cmds to Arduino
                init: function() {
                    // Uninit previous runs to unsubscribe correctly, i.e.
                    // so we don't subscribe 100's of times each time we modify
                    // and run this macro
                    if (window["myMacro"]) {
                        macro.status("This macro was run before. Cleaning up...");
                        window["myMacro"].uninit();
                    }
                    macro.status("Starting watch onComplete macro");
                    // subscribe to onComplete
                    chilipeppr.subscribe("/com-chilipeppr-widget-serialport/onComplete", this, this.onComplete);
                    // store macro in window object so we have it next time thru
                    window["myMacro"] = this;
                    this.getGcode();
                },
                uninit: function() {
                    macro.status("Uninitting macro.");
                    chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/onComplete", this.onComplete);
                },
                getGcode: function() {
                    chilipeppr.subscribe("/com-chilipeppr-widget-gcode/recvGcode", this, this.getGcodeCallback);
                    chilipeppr.publish("/com-chilipeppr-widget-gcode/requestGcode", "");
                    chilipeppr.unsubscribe("/com-chilipeppr-widget-gcode/recvGcode", this.getGcodeCallback);
                },
                getGcodeCallback: function(data) {
                    this.gcode = data;
                },
                onComplete: function(data) {
                    // macro.status("Got onCompleted. data:" + JSON.stringify(data));
                    // Id's from the Gcode widget always start with g
                    // If you jog, use the serial port console, or do other stuff we'll 
                    // see callbacks too, but we only want real gcode data here
                    if (data.Id.match(/^g(\d+)/)) {
                        // $1 is populated with digits from the .match regex above
                        var index = parseInt(RegExp.$1); 
                        // our id is always 1 ahead of the gcode.lines array index, i.e.
                        // line 1 in the widget is this.gcode.lines[0]
                        var gcodeline = this.gcode.lines[index - 1];
                        
                        // Try to match M3, M5, and M30 (program end)
                        // The \b is a word boundary so looking for M3 doesn't also
                        // hit on M30
                        if (gcodeline.match(/\bM3\b/i)) {
                            // turn laser off
                            macro.status("Laser Off from line " + data.Id);
                            chilipeppr.publish("/com-chilipeppr-widget-serialport/ws/send", "send " + this.arduinoSerialPort + " laser-off\n");
                        } else if (gcodeline.match(/\bM5\b/i)) {
                            // turn laser on
                            macro.status("Laser On from line " + data.Id);
                            chilipeppr.publish("/com-chilipeppr-widget-serialport/ws/send", "send " + this.arduinoSerialPort + " laser-on\n");
                        } else if (gcodeline.match(/\bM30\b/i)) {
                            macro.status("Done running our gcode. Laser off.");
                            chilipeppr.publish("/com-chilipeppr-widget-serialport/ws/send", "send " + this.arduinoSerialPort + " laser-off\n");
                            this.uninit();
                        }
                        
                    }
                }
            }
            myMacro.init();
        },
        iterateGcode: function() {
            var gcodeIterator = {
                user3dObject: null, // stores 3d obj which also has gcode
                init: function() {
                    this.get3dObjectFrom3dViewer();
                    this.loopThruGcode();
                },
                recv3dObject: function(obj) {
                    console.log("just got the user object:");
                    this.user3dObject = obj;
                },
                get3dObjectFrom3dViewer: function() {
                    // query the 3d viewer for it's core object
                    chilipeppr.subscribe("/com-chilipeppr-widget-3dviewer/recv3dObject", this, this.recv3dObject);
                    chilipeppr.publish("/com-chilipeppr-widget-3dviewer/request3dObject", "");
                    chilipeppr.unsubscribe("/com-chilipeppr-widget-3dviewer/recv3dObject", this, this.recv3dObject);
                },
                loopThruGcode: function() {
                    var ctr = 0;
                    this.user3dObject.userData.lines.forEach(function(item) {                        
                        //console.log("line of gcode:", item);
                        if (item.args.cmd == "G0") ctr++;
                    });
                    macro.status("You have " + ctr + " G0's in your Gcode");
                }
            };
            gcodeIterator.init();
                                                             
        },
        injectCams: function() {
            // Inject cams v1.2
            // You must be running your MultiCam 
            // server from
            // http://jsfiddle.net/chilipeppr/stpbm/
            // You can run the server from any number 
            // of computers to gang up tons of 
            // cameras. This client below will pull 
            // in all cameras being served and inject 
            // them in a new right column
            var cams = {
                init: function() {
                    $('#com-chilipeppr-ws-gcode-hdr').parent().addClass('nopadding');
                    $('#com-chilipeppr-webrtcclient').remove();
                    $('.pnlWorkspaceRtSidebarCollapsed').removeClass('col-xs-12').addClass('col-xs-10');
                    $('#pnlRtSidebar').addClass('col-xs-2 nopadding').css('padding-right', '10px');
                    // $('#pnlRtSidebar').html("");
                    chilipeppr.load('#pnlRtSidebar', 'http://jsfiddle.net/chilipeppr/k9aXL/show/light', function() {
                        macro.status("Cam fiddle loaded.");
                    });
                },
                initCams: function() {
                    macro.status("initting cams");
                    cprequire(["inline:com-chilipeppr-widget-webrtc-clientmulti"], function (camlist) {
                        console.log("running of " + camlist.id);
                        camlist.init();
                    });
                }
            }
            cams.init();
            cams.initCams();
        },
        downloadGcode: function() {
            // Opens new window and downloads Gcode to 
            // local file. Shows use of cprequire() 
            // which is the way to get access to any 
            // of ChiliPeppr's modules. You can 
            // override methods in a module, call 
            // methods directly, or access properties 
            // of that module.
            cprequire(['inline:com-chilipeppr-widget-gcode'], function(gcode) {
                var txt = gcode.fileLines.join('\n');
                window.open('data:text/csv;charset=utf-8,' + escape(txt));
            });
        },
        sendToArduino: function() {
            // Send a command to an Arduino on an alternate serial port
            // while connected to your CNC machine on the main serial port.
            
            // Keep in mind the "green" colored serial port is the default
            // serial port for your CNC controller. You must be connected
            // to your Arduino on an alternate serial port with a checkbox
            // marked in the Serial Port Widget to show you're connected
            // but it must not be "green" to ensure it's not the default
            
            var mymacro = {
                portArduino: "COM18",
                init: function() {
                    macro.status("Initted my macro");
                    // Subscribe to receive data events for all com ports
                    // We will filter for our serial port data
                    chilipeppr.subscribe("/com-chilipeppr-widget-serialport/ws/recv", this, this.onRecvData);
                    // Subscribe to incoming position data from CNC controller
                    chilipeppr.subscribe("/com-chilipeppr-interface-cnccontroller/axes", this, this.onRecvPosition);
                },
                uninit: function() {
                    macro.status("Uninitted my macro");
                    chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/ws/recv", this.onRecvData);
                    chilipeppr.unsubscribe("/com-chilipeppr-interface-cnccontroller/axes", this.onRecvPosition);
                },
                msg: "", // stores data received
                onRecvData: function(data) {
                    // data comes in as it arrives, so not as lines
                    // wait until we see a newline
                    
                    // see if json
                    if (data.match(/^{/)) {
                        var json = $.parseJSON(data);
                        if ('P' in json && json.P == this.portArduino) {
                            console.log("got onRecvData for this port. json:", json);
                            this.msg += json.D;
                            if (this.msg.match(/\n/)) {
                                macro.status(this.msg);
                                this.msg = ""; // clear buffer
                            }
                        }
                    }
                },
                onRecvPosition: function(pos) {
                    // we get a nice object of XYZ values
                    if (pos.x == 0 && pos.x == 0) {
                        macro.status("Got 0,0 position so turn laser off");
                        // Send command to Arduino, i.e. to tell it to turn laser off
                        chilipeppr.publish("/com-chilipeppr-widget-serialport/ws/send", "send " + this.portArduino + " laser-off\n");
                        macro.status("Laser Off");
                        mymacro.uninit();
                    }
                },
                go: function() {
                    
                    // Send command to Arduino, i.e. to tell it to turn laser on
                    // Notice you must specify a port in this "/ws/send" since this
                    // serial port is not the default
                    chilipeppr.publish("/com-chilipeppr-widget-serialport/ws/send", "send " + this.portArduino + " laser-on\n");
                    macro.status("Laser On");
                    
                    // Send command to CNC
                    chilipeppr.publish("/com-chilipeppr-widget-serialport/send", "G0 X0 Y0\n");
                    chilipeppr.publish("/com-chilipeppr-widget-serialport/send", "G0 X1 Y1\n");
                    chilipeppr.publish("/com-chilipeppr-widget-serialport/send", "G0 X0 Y0\n");
                    
                }
            }
            mymacro.init();
            mymacro.go();

            
        },
        cmdsSentViaTimeout: function() {
            // Loop the CNC machine
            chilipeppr.publish("/com-chilipeppr-widget-serialport/send", "G90\n"); // abs mode
            chilipeppr.publish("/com-chilipeppr-widget-serialport/send", "G0 X0 Y0\n"); // 0,0
            var timeout = 1000;
            var cmds = [];
            var ctr = 0;
            for(var x = 0; x < 10; x++) {
                for(var y = 0; y < 10; y++) {
                    cmds.push("G1 X" + x + " Y" + y + " F100\n");
                    setTimeout(function() {
                        var cmd = cmds[ctr];
                        chilipeppr.publish("/com-chilipeppr-widget-serialport/send", cmd);
                        macro.status("Sent " + cmd);
                        ctr++;
                    }, timeout);
                    timeout = timeout + 1000;
                }
            }
        },
        addbbox: function() {
            var add = function() {
                chilipeppr.subscribe("/com-chilipeppr-widget-3dviewer/recv3dObject", function(obj) {
                    console.log("3d obj:", obj);
                    window["bbox"] = new THREE.BoundingBoxHelper(obj, 0xff0000)
                    window["bbox"].update();
                    // Create visible bounding box
                    chilipeppr.publish("/com-chilipeppr-widget-3dviewer/sceneadd", window["bbox"]);
                    macro.status("added bounding box");
                });
                chilipeppr.publish("/com-chilipeppr-widget-3dviewer/request3dObject", "");
            };
            var remove = function() {
                console.log(window["bbox"]);
                chilipeppr.publish("/com-chilipeppr-widget-3dviewer/sceneremove", window["bbox"]);
                macro.status("removed bounding box");
            };
            // don't run add twice or it will rewrite a new bbox and you'll
            // never be able to remove it
            add(); // comment this out and uncomment remove();
            //remove();
        },
        fadeout: function() {
            chilipeppr.subscribe("/com-chilipeppr-widget-3dviewer/recv3dObject", function(threed) {
                console.log("3d obj:", threed);
                threed.children[0].material.opacity = 0.99;
                chilipeppr.publish("/com-chilipeppr-widget-3dviewer/wakeanimate");
                macro.status("Faded out 3d object");
            });
            chilipeppr.publish("/com-chilipeppr-widget-3dviewer/request3dObject", "");

        },
        sendGcodeToWorkspace: function() {
            var gcodetxt = "(This is my gcode)\nG92\nG0 Z1\nG1 X10\nY10\nX0\nY0\n";
            var info = {
                name: "My gcode file", 
                lastModified: new Date()
            };
            // send event off as if the file was drag/dropped
            chilipeppr.publish("/com-chilipeppr-elem-dragdrop/ondropped", gcodetxt, info);
        },
        runTestProbe: function() {
            macro.status("Runing test probe.");
            chilipeppr.publish("/com-chilipeppr-widget-serialport/send", "G21 G90 (Use mm and abs coords)\n");
            chilipeppr.publish("/com-chilipeppr-widget-serialport/send", "G38.2 Z-10 F5\n");
        },
        watch: function() {
            // Send a Gcode command and then 
            // watch the serial response
            // to trigger something next
            var that = this;
            var callback = function(data) {
                macro.status("data:" + data.dataline);
                
                var json = $.parseJSON(data.dataline);
                
                if ('sr' in json && ('posz' in json.sr || 'mpoz' in json.sr)) {
                    
                    var zpos = null;
                    if ('posz' in json.sr) zpos = json.sr.posz;
                    else zpos = json.sr.mpoz;
                    
                    zpos = parseFloat(zpos);
                    if (zpos == 3) {
                        // we hit the Z location we wanted.
                        chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/recvline", that, callback);
                        
                        alert("got to location we wanted");
                        macro.status("got to z loc of 3.00");
                    }
                }
                
            };
            
            // now subscribe and then usubscribe 
            // so we don't get all responses
            // after the data we want.
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvline", this, callback);
            
            // Send Gcode.
            macro.sendSerial("G0 Z4\n");
            macro.sendSerial("G0 Z3\n");
            
            macro.status("Just sent Gcode cmd. Watching for response...");
        },
        sendSerial: function(gcode) {
            // send our data
            chilipeppr.publish("/com-chilipeppr-widget-serialport/send", gcode);
        },
        // END SAMPLES
        
        statEl: null, // cache the status element in DOM
        status: function(txt) {
            console.log("status. txt:", txt);
            if (this.statEl == null) this.statEl = $('#com-chilipeppr-widget-macro-status');
            var len = this.statEl.val().length;
            if (len > 3000) {
                console.log("truncating status area text");
                this.statEl.val(this.statEl.val().substring(len-1500));
            }
            this.statEl.val(this.statEl.val() + "\n" + txt);
            this.statEl.scrollTop(
                this.statEl[0].scrollHeight - this.statEl.height()
            );
        },
        getZMinSettings: function(donecallback) {
            // query tinyg for z min settings, then store, so we can
            // reset them later
            var send = '{"z":""}\n';
            // expect something back like
            /* {"r":{"z":{"am":1,"vm":400,"fr":200,"tm":70,"jm":3000000,"jh":20000000,"jd":0.0500,"sn":1,"sx":0,"sv":20,"lv":10,"lb":10.000,"zb":0.000},"f":[1,0,9,7178]}}
            */
            
            // this callback will get the recvline from tinyg for the expected
            // settings response
            var that = this;
            var callback = function(data) {
                console.log("got my callback for z settings. data:", data);
                // make sure it's the data we want
                if (!('dataline' in data)) {
                    console.log("did not get dataline in data. returning.");
                    return;
                }
                
                var json = $.parseJSON(data.dataline);
                if ('r' in json && 'z' in json.r) {
                    // yes, it's our data
                    // store it
                    that.zsettings = json.r;
                    console.log("settings for z looked good. storing. zsettings:", that.zsettings);
                    
                    // unsub
                    chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/recvline", that, callback);
                    
                    if (donecallback) donecallback.call(that);
                }
            };
            
            // now subscribe and then usubscribe so we don't get all responses
            // after the data we want.
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvline", this, callback);
            // send our data
            chilipeppr.publish("/com-chilipeppr-widget-serialport/send", send);
        },
        threeDGetUserObject: function() {
             // query the 3d viewer for it's core object
            var obj3d;
            var recv3dObject = function(data) {
                obj3d = data;
            };
            
            chilipeppr.subscribe("/com-chilipeppr-widget-3dviewer/recv3dObject", this, recv3dObject);
            chilipeppr.publish("/com-chilipeppr-widget-3dviewer/request3dObject", "");
            chilipeppr.unsubscribe("/com-chilipeppr-widget-3dviewer/recv3dObject", this, recv3dObject);
            
        },
        threeDMakeText: function(vals) {
            var shapes, geom, mat, mesh;
            
            //console.log("Do we have the global ThreeHelvetiker font:", ThreeHelvetiker);
            
            THREE.FontUtils.loadFace(ThreeHelvetiker);
            shapes = THREE.FontUtils.generateShapes( vals.text, {
                font: "helvetiker",
                //weight: "normal",
                size: vals.size ? vals.size : 10
            } );
            geom = new THREE.ShapeGeometry( shapes );
            mat = new THREE.MeshBasicMaterial({
                color: vals.color,
                transparent: true,
                opacity: 0.8,
            });
            mesh = new THREE.Mesh( geom, mat );
            
            mesh.position.x = vals.x;
            mesh.position.y = vals.y;
            mesh.position.z = vals.z;
            
            return mesh;
            
            
        },
        forkSetup: function () {
            var topCssSelector = '#' + this.id;
            
            $(topCssSelector + ' .panel-title').popover({
                title: this.name,
                content: this.desc,
                html: true,
                delay: 200,
                animation: true,
                trigger: 'hover',
                placement: 'auto'
            });
            
            var that = this;
            chilipeppr.load("http://raw.githubusercontent.com/rixnco/widget-pubsubviewer/master/auto-generated-widget.html", function () {
                require(['inline:com-chilipeppr-elem-pubsubviewer'], function (pubsubviewer) {
                    pubsubviewer.attachTo($(topCssSelector + ' .panel-heading .dropdown .dropdown-menu-main'), that);
                });
            });
            
        },
    }
});