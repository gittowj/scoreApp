jQuery.cookie = function (name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

$.format = function (source, params) {
    if (arguments.length == 1)
        return function () {
            var args = $.makeArray(arguments);
            args.unshift(source);
            return $.validator.format.apply(this, args);
        };
    if (arguments.length > 2 && params.constructor != Array) {
        params = $.makeArray(arguments).slice(1);
    }
    if (params.constructor != Array) {
        params = [params];
    }
    $.each(params, function (i, n) {
        source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
    });
    return source;
};

/* Nano Templates (Tomasz Mazur, Jacek Becela) */

(function ($) {
    $.nano = function (template, data) {
        return template.replace(/\{([\w\.]*)\}/g, function (str, key) {
            var keys = key.split("."), value = data[keys.shift()];
            $.each(keys, function () { value = value[this]; });
            return (value === null || value === undefined) ? "" : value;
        });
    };
})(jQuery);

function getParams(url, c) {
    if (!url) url = location.href;
    if (!c) c = "?";
    url = url.split(c)[1];
    var params = {};
    if (url) {
        var us = url.split("&");
        for (var i = 0, l = us.length; i < l; i++) {
            var ps = us[i].split("=");
            params[ps[0]] = decodeURIComponent(ps[1]);
        }
    }
    return params;
}

function t(text) {
    if ((typeof (T) != "undefined") && T[text]) {
        return T[text];
    }
    else {
        return text;
    }
}

function htmlEncode(value) {
    return $('<div/>').text(value).html();
}

function htmlDecode(value) {
    return $('<div/>').html(value).text();
}

function urlEncode(strURL) {
    var m = "", sp = "!'()*-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz~";
    for (var i = 0; i < strURL.length; i++) {
        if (sp.indexOf(strURL.charAt(i)) != -1) {
            m += strURL.charAt(i)
        }
        else {
            var n = strURL.charCodeAt(i)
            var t = "0" + n.toString(8)
            if (n > 0x7ff)
                m += ("%" + (224 + parseInt(t.slice(-6, -4), 8)).toString(16) + "%" + (128 + parseInt(t.slice(-4, -2), 8)).toString(16) + "%" + (128 + parseInt(t.slice(-2), 8)).toString(16)).toUpperCase()
            else if (n > 0x7f)
                m += ("%" + (192 + parseInt(t.slice(-4, -2), 8)).toString(16) + "%" + (128 + parseInt(t.slice(-2), 8)).toString(16)).toUpperCase()
            else if (n > 0x3f)
                m += ("%" + (64 + parseInt(t.slice(-2), 8)).toString(16)).toUpperCase()
            else if (n > 0xf)
                m += ("%" + n.toString(16)).toUpperCase()
            else
                m += ("%" + "0" + n.toString(16)).toUpperCase()
        }
    }
    return m;
}

function formatFormTitle(titleInfo) {
    if (typeof (titleInfo) != "undefined" && titleInfo != null && $.trim(titleInfo) != "") {
        if (titleInfo.length > 40) {
            titleInfo = titleInfo.substring(0, 40);
        }
        return $.format(" - {0}", titleInfo);
    }
    return "";
}

/* lhgdialog extention begin */

if ($.dialog) {

    (function (config) {
        config['lock'] = true;
        config['cancel'] = true;
        config['title'] = '';
    })(top.$.dialog.setting);

    /**
    * message dialog
    * @param	{String}	content
    * @param   {Number}    display time (1.5 sec as default)
    * @param	{String}	icon (with ext)
    * @param   {Function}  callback
    */
    lhgdialog.msg = function (content, time, icon, callback, settings) {
        var reIcon = icon ? function () {
            this.DOM.icon[0].innerHTML = '<img src="' + this.config.path + 'skins/icons/' + icon + '" class="ui_icon_bg"/>';
            this.DOM.icon[0].style.display = '';
            if (callback) this.config.close = callback;
        } : function () {
            this.DOM.icon[0].style.display = 'none';
            if (callback) this.config.close = callback;
        };

        var cfg = $.extend({
            id: 'msg',
            zIndex: top.lhgdialog.setting.zIndex,
            title: false,
            cancel: false,
            fixed: true,
            lock: true,
            resize: false
        }, settings || {});

        var parent;
        var list = top.lhgdialog.list;
        for (var i in list) {
            parent = list[i];
        }

        if (parent) {
            cfg.parent = parent;
        }

        content = content.replace(/\n/g, "<br>");

        var dlg = top.lhgdialog(cfg).content(content);

        if (time) {
            dlg.time(time || 1.5, reIcon);
        }
        else {
            reIcon.apply(dlg);
        }

        return dlg;
    };
}

/* lhgdialog extention end */

/* prompt message system begin */

function showMsg(msg) {
    if (msg) {
        top.lhgdialog.msg(msg, null, 'loading.gif');
    }
    else {
        var content = '<img src="' + top.$.dialog.setting.path + 'skins/icons/loading.gif" style="margin: 0;" />';
        top.lhgdialog.msg(content, null, null);
    }
}

function hideMsg() {
    var msgDlg = top.lhgdialog.list["msg"];
    if (msgDlg) {
        msgDlg.close();
    }
}

function loadingMsg(msg) {
    if (msg) {
        top.lhgdialog.msg(msg, null, 'loading.gif');
    }
    else {
        var content = '<img src="' + top.$.dialog.setting.path + 'skins/icons/loading.gif" style="margin: 0;" />';
        top.lhgdialog.msg(content, null, null);
    }
}

var closeBtn = '<a id="close-msg" href="javascript:void(0);" class="close-msg">X</a>';

function successMsg(msg, callback) {
    var content = '<img src="' + top.$.dialog.setting.path + 'skins/icons/32X32/succ.png" style="margin: 0; width:28px; height:28px;" class="ui_icon_bg"/>';
    var icon = "32X32/succ.png";
    if (msg != "") {
        content = msg + closeBtn;
    }
    else {
        icon = null;
    }

    top.lhgdialog.msg(content, null, icon);

    //    if (msg == "") {
    window.setTimeout(function () {
        _callback();
    }, 1000);
    //    }
    //    else {
    //        top.$("#close-msg").click(_callback);
    //    }

    function _callback() {
        var notHideMsg = false;
        if (callback && $.isFunction(callback)) {
            var notHideMsg = callback();
        }
        if (!notHideMsg) {
            hideMsg();
        }
    }
}

function errorMsg(msg, callback) {
    var icon = "32X32/hits.png";
    msg += closeBtn;
    top.lhgdialog.msg(msg, null, icon);

    top.$("#close-msg").click(_callback);

    function _callback() {
        hideMsg();
        if (callback && $.isFunction(callback)) {
            callback();
        }
    }
}

function handleResult(ar, successCallback, errorCallback) {
    if (ar && ar.Success) {
        if (ar.Message == null) {
            hideMsg();
            _callback(successCallback);
        }
        else {
            successMsg(ar.Message, function () {
                _callback(successCallback);
            });
        }
    }
    else {
        errorMsg(ar.Message, function () {
            _callback(errorCallback);
        });
    }

    function _callback(callback) {
        if (callback && $.isFunction(callback)) {
            callback();
        }
        if (ar && ar.RedirectUrl && ar.RedirectUrl != "") {
            window.location = ar.RedirectUrl;
            return true;
        }

        return false;
    }
}

function onBegin() {
    showMsg();
}

function onSuccess(ar) {
    handleResult(ar);
}

$(document).ajaxError(function (e, xhr, settings) {
    hideMsg();
    try {
        var ar = $.parseJSON(xhr.responseText);
    }
    catch (e) {
        return;
    }

    if (ar && ar.Message) {
        top.$.dialog({
            title: "系统异常",
            content: $.format("{0}", ar.Message.replace(/\n/g, "<br>")),
            width: 600,
            height: 300,
            icon: "error.gif",
            lock: true
        });
    }
});


/* prompt message system end */

/* jQuery easyui extention begin */

$.fn.datagrid.defaults = $.extend($.fn.datagrid.defaults, {
    striped: true,
    singleSelect: true,
    idField: "ID",
    fit: true,
    fitColumns: true,
    nowrap: false,
    border: false,
    headerCls: "ctb-panel",
    onLoadSuccess: function (data) {
        $('.easyui-linkbutton').linkbutton({
            plain: true
        });
    }
});

function fitGridWidth(target) {
    $(window).resize(function () {
        var panel = $.data($(target)[0], 'datagrid').panel;
        var p = panel.panel('panel').parent();
        p.addClass('panel-noscroll');
        var width = p.width();

        panel.panel('resize', {
            width: width
        });
    });
}

function fitPanelWidth(target) {
    $(window).resize(function () {
        var opts = $.data(target, 'panel').options;
        var panel = $.data(target, 'panel').panel;
        var p = panel.parent();
        p.addClass('panel-noscroll');
        var width = p.width();

        $(target).panel('resize', {
            width: width
        });
    });
}

$.extend($.fn.datagrid.defaults.editors, {
    combo: {
        init: function (container, options) {
            var input = $('<select type="text" class="datagrid-editable-input">').appendTo(container);
            $.each(options.data, function (index, value) {
                $('<option value="' + value.value + '">' + value.text + '</option>').appendTo(input);
            });
            return input;
        },
        getValue: function (target) {
            return $(target).find('option:selected').val();
        },
        setValue: function (target, value) {
            $(target).val(value);
        },
        resize: function (target, width) {
            var input = $(target);
            if ($.boxModel == true) {
                input.width(width - (input.outerWidth() - input.width()));
            } else {
                input.width(width);
            }
        }
    }
});

$.extend($.fn.tree.methods, {
    getCheckedEx: function (jq) {
        return getCheckedNode(jq);
    }
});

function getCheckedNode(target) {
    var nodes = [];
    $(target).find('.tree-checkbox1,.tree-checkbox2').each(function () {
        var node = $(this).parent();
        nodes.push($(target).tree("getNode", node[0]));
    });
    return nodes;
}

/* jQuery easyui extention end */

/* jQuery validate extention begine */
jQuery.validator.defaults.ignore = '';

jQuery.validator.addMethod("noBeginBlankSpace", function (value, element) {
    if ($(element).attr("checkspace") == "false") return true;

    return this.optional(element) || !/^\s.+$/i.test(value);
}, t("This field cannot begin with a space."));

jQuery.validator.addMethod("noEndBlankSpace", function (value, element) {
    return this.optional(element) || !/^.+\s$/i.test(value);
}, t("This field cannot end with a space."));

/* jQuery validate extention end */


function requiredDataAddMark() {
    $("[data-val-required][generatemark!=False]").each(function (i, o) {
        $($(this).parent().parent().children(".editor-label")).prepend("<label style='color:red;width:2px;'>*</label>");
    });
}

// Monitoring data to change
function MonitorDataChange() {
    //Page editing data
    this.inputsData;
    this.textareasData;
    this.selectsData;
    //record original value of form
    this.initFileds = function (target) {
        var inputs = target.getElementsByTagName("input");
        var textareas = target.getElementsByTagName("textarea");
        var selects = target.getElementsByTagName("select");
        inputsData = new Array(inputs.length);
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].type == "radio" || inputs[i].type == "checkbox") {
                inputsData[i] = inputs[i].checked;
            } else
                inputsData[i] = inputs[i].value;
        }
        textareasData = new Array(textareas.length);
        for (var i = 0; i < textareas.length; i++) {
            textareasData[i] = textareas[i].value;
        }
        selectsData = new Array(selects.length);
        for (var i = 0; i < selects.length; i++) {
            selectsData[i] = selects[i].value;
        }
    }
    /*
    * check the form is modified
    * submitCommand  when form is modified,execute javascript code
    */
    this.checkModification = function (target, isReLoad) {
        var inputs = target.getElementsByTagName("input");
        var textareas = target.getElementsByTagName("textarea");
        var selects = target.getElementsByTagName("select");
        var hasBeenChanged = false;
        for (var i = 0; i < inputs.length; i++) {
            if ((inputs[i].type == "radio" || inputs[i].type == "checkbox") && (inputs[i].checked != inputsData[i])) {
                hasBeenChanged = true;
                if (isReLoad) {
                    inputsData[i] = inputs[i].checked;
                }
            }
            else if ((inputs[i].type != "radio" && inputs[i].type != "checkbox") && inputsData[i] != inputs[i].value) {
                //inputs[i].type != "radio" && inputsData[i] != inputs[i].value
                if (inputs[i].name != "actionType") {
                    hasBeenChanged = true;
                }
                if (isReLoad)
                    inputsData[i] = inputs[i].value;
            }
        }
        for (var i = 0; i < textareas.length; i++) {
            if (textareasData[i] != textareas[i].value) {
                hasBeenChanged = true;
                if (isReLoad)
                    textareasData[i] = textareas[i].value;
            }
        }
        for (var i = 0; i < selects.length; i++) {
            if (selectsData[i] != selects[i].value) {
                hasBeenChanged = true;
                if (isReLoad)
                    selectsData[i] = selects[i].value;
            }
        }
        return hasBeenChanged;
    }
    this.undoChange = function (target) {
        var inputs = target.getElementsByTagName("input");
        var textareas = target.getElementsByTagName("textarea");
        var selects = target.getElementsByTagName("select");

        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].type == "radio" || inputs[i].type == "checkbox") {
                inputs[i].checked = inputsData[i];
            }
            else if (inputs[i].type == "button") {
            }
            else
                inputs[i].value = inputsData[i];
        }

        for (var i = 0; i < textareas.length; i++) {
            textareas[i].value = textareasData[i];
        }

        for (var i = 0; i < selects.length; i++) {
            selects[i].value = selectsData[i];
        }
    }
}

function dlgPage(url) {
    return $.format("url:{0}", url);
}

$(function () {
    $("form").validate();
    $("form :text[checkspace!=false], form textarea[checkspace!=false]").each(function () {
        $(this).rules("add", "noBeginBlankSpace");
        $(this).rules("add", "noEndBlankSpace");
    });

    requiredDataAddMark();
});


$.fn.extend({
    toggleWhatYouControl: function () {
        var _this = $(this);
        var _controllees = $("[data-controllerid=" + _this.attr("id") + "]");
        var _controlleesAreHidden = _controllees.is(":hidden");
        if (_this.is(":checked")) {
            if (_controlleesAreHidden) {
                _controllees.hide(); // <- unhook this when the following comment applies
                $(_controllees.show()[0]).find("input").focus(); // <- aaaand a slideDown there...eventually
            }
        } else if (!_controlleesAreHidden) {
            //_controllees.slideUp(200); <- hook this back up when chrome behaves, or when I care less...or when chrome behaves
            _controllees.hide()
        }
        return _this;
    }
});

//set focus for the first textbox
function setFirstTextBoxFocus() {
    var inputs = $("input");
    for (i = 0; i < inputs.length - 1; i++) {
        if (inputs[i].type != "hidden") {
            inputs[i].focus();
            break;
        }
    }
}

// collapsable areas - anything with a data-controllerid attribute has its visibility controlled by the id-ed radio/checkbox
$(function () {
    setFirstTextBoxFocus();
    $("[data-controllerid]").each(function () {
        var controller = $("#" + $(this).attr("data-controllerid"));
        if (controller.data("isControlling")) {
            return;
        }
        controller.data("isControlling", 1);
        if (!controller.is(":checked")) {
            $("[data-controllerid=" + controller.attr("id") + "]").hide();
        }
        if (controller.is(":checkbox")) {
            controller.click($(this).toggleWhatYouControl);
        } else if (controller.is(":radio")) {
            $("[name=" + controller.attr("name") + "]").click(function () { $("[name=" + $(this).attr("name") + "]").each($(this).toggleWhatYouControl); });
        }
    });
});

// modify jQuery's serializeArray method to include disabled controls.
$.fn.serializeArrayEx = function () {
    var rselectTextarea = /^(?:select|textarea)/i;
    var rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i;
    return this.map(function () {
        return this.elements ? jQuery.makeArray(this.elements) : this;
    })
		.filter(function () {
		    //		    return this.name && !this.disabled &&
		    return this.name &&
				(this.checked || rselectTextarea.test(this.nodeName) ||
					rinput.test(this.type));
		})
		.map(function (i, elem) {
		    var val = jQuery(this).val();

		    return val == null ?
				null :
				jQuery.isArray(val) ?
					jQuery.map(val, function (val, i) {
					    return { name: elem.name, value: val };
					}) :
					{ name: elem.name, value: val };
		}).get();
}