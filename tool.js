/**
 * 工具类
 * **/
!function(){
    "use strict";
    if(typeof  window.xiaoc !== "function"){
        window.xiaoc = function(){
            this.go_logining = false;
        };
    }

    xiaoc.prototype = {
        get_version : function(){
            return "1.0";
        },
        device : {
            //系统及版本
            system : function(callback){
                var is_call_back = (typeof(callback) != "undefined" && typeof(eval(callback)) == "function");
                try{
                    if($$.bridge && typeof $$.bridge.callHandler == 'function') {
                        $$.bridge.callHandler('native_handle', "device", function (result) {
                            //confirm(JSON.stringify(result));
                            //confirm(result["system_name"]);
                            /**
                             * phone_name : 手机名称
                             * system_name : 手机系统名称
                             * system_version : 手机系统版本号
                             * device_model : 设备模式(是模拟器还是真机)
                             * device_local_model : 本地设备模式(地方型号)
                             * device_uuid : 设备唯一标示码(AndroidID)
                             * device_mac : MAC地址
                             * phone_brand : 手机品牌
                             * phone_model : 手机品牌型号
                             * core_version : 内核版本
                             * available_memory : 可用内存
                             */
                            if(is_call_back) callback(result);
                        });
                    }else{
                        var result = '';
                        //浏览器方式拿
                        var u = navigator.userAgent;
                        var version = '';
                        if (u.indexOf('Mobile') < 0) {
                            result = "pc";
                        } else if (u.indexOf('Mac OS X') > -1) {
                            var regStr_saf = /OS [\d._]*/gi;
                            var verinfo = u.match(regStr_saf);
                            version = (verinfo + "").replace(/[^0-9|_.]/ig, '').replace(/_/ig, '.');
                            result = "iOS " + version;
                        } else if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {
                            version = u.substr(u.indexOf('Android') + 8, u.indexOf(";", u.indexOf("Android")) - u.indexOf('Android') - 8);
                            result = "Android " + version;
                        } else if (u.indexOf('BB10') > -1) {
                            version = u.substr(u.indexOf('BB10') + 5, u.indexOf(";", u.indexOf("BB10")) - u.indexOf('BB10') - 5);
                            result = "BlackBerry_BB10_OS " + version;
                        } else if (u.indexOf('BlackBerry') > -1) {
                            if (u.indexOf("Version/") >= 0) {
                                var position = u.indexOf("Version/") + 8;
                                version = u.substring(position, position + 10);
                            } else {
                                var SplitUA = u.split("/");
                                version = SplitUA[1].substring(0, 3);
                            }
                            result = {
                                system_name : "BlackBerry_OS",
                                system_version : version
                            };
                        } else if (u.indexOf('IEMobile')) {
                            version = u.substr(u.indexOf('IEMobile') + 9, u.indexOf(";", u.indexOf("IEMobile")) - u.indexOf('IEMobile') - 9);
                            result = "Windows_Phone " + version;
                        }
                        if (is_call_back) callback(result);
                    }
                }catch (err){
                    if(is_call_back) callback(err);
                }
            }
        },
        get_uuid : function(){
            if($$.localStorage.getItem("uuid")){
                return $$.localStorage.getItem("uuid");
            }else {
                var s = [];
                var hexDigits = "0123456789abcdef";
                for (var i = 0; i < 36; i++) {
                    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
                }
                s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
                s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
                s[8] = s[13] = s[18] = s[23] = "-";

                var result = s.join("");
                $$.localStorage.setItem("uuid",result);
                return result;
            }
        },
        obj : function(str) {
            if (str) {
                if (str.indexOf("#") === 0) {
                    return document.getElementById(str.replace("#", ""));
                } else if (str.indexOf(".") === 0) {
                    return document.getElementsByClassName(str.replace(".", ""));
                } else if (str.indexOf("<") === 0 && str.indexOf(">") === str.length - 1) {
                    return document.getElementsByTagName(str.replace("<", "").replace(">", ""))
                } else {
                    return null;
                }
            }
        },
        //登录检查 bool : true 有返回值，返回bool：true（已登录） false（未登录or登录失效）
        login_check : function(callback,bool){
            var that = this;
            var is_login = false;

            try {
                var is_call_back = (typeof(callback) != "undefined" && typeof(eval(callback)) == "function");
                $$.bridge.callHandler('native_handle','localStorage_get_is_checked',function(result) {
                    if (result["code"] == 1 && result["err"] == 1) {

                        var login_bool = result2["msg"];

                        $$.bridge.callHandler('native_handle', 'localStorage_get_login_invalid_timestamp', function (result2) {
                            if (result2["code"] == 1 && result2["err"] == 1) {

                                var login_timestamp = result2["msg"];

                                if (
                                    !login_bool || !login_timestamp || //未找到缓存
                                    login_timestamp - new Date().getTime() <= 0  //登录失效
                                ) {
                                    //未登录 or 失效
                                    is_login = false;
                                } else {
                                    //已登录且有效
                                    is_login = true;
                                }

                            } else {
                                is_login = false;
                            }

                            if (bool) {
                                if (is_call_back) callback(is_login);
                                else return is_login;
                            } else {
                                if (!is_login) {
                                    setTimeout(function () {
                                        that.push_view_controller("login_view_controller", "bottom-center");
                                    }, 200);
                                }
                            }
                        });
                    } else {
                        is_login = false;

                        if (bool) {
                            if (is_call_back) callback(is_login);
                            else return is_login;
                        } else {
                            if (!is_login) {
                                setTimeout(function () {
                                    that.push_view_controller("login_view_controller", "bottom-center");
                                }, 200);
                            }
                        }
                    }
                });
            }catch (err){
                var login_bool = that.localStorage.getItem("is_checked");
                var login_timestamp = that.localStorage.getItem("login_invalid_timestamp");

                if(
                    !login_bool || !login_timestamp || //未找到缓存
                    login_timestamp - new Date().getTime() <= 0  //登录失效
                ){
                    //未登录 or 失效
                    is_login = false;
                }else{
                    //已登录且有效
                    is_login = true;
                }

                if(bool){
                    if(is_call_back) callback(is_login);
                    else return is_login;
                }else{
                    if(!is_login){
                        setTimeout(function() {
                            that.push_view_controller("login_view_controller", "bottom-center");
                        },200);
                    }
                }
            }
        },
        get_system_lang : function(){
            var lang = navigator.language;
            lang = lang ? lang : navigator.browserLanguage;
            return lang?lang.toLocaleLowerCase():false;
        },
        get_user_language : function(callback,bool){
            var that = this;
            var is_call_back = (typeof(callback) != "undefined" && typeof(eval(callback)) == "function");
            if(bool){
                //是否用最新
                $$.get_user_data(function(data){
                    try {
                        var get_language = data["data"]["userInfo"]["userInfo"]["language"];
                        if(get_language) {
                            try {
                                $$.bridge.callHandler("native_handle", "localStorage_set_u_language:" + get_language);
                                if(is_call_back) callback(get_language);
                            } catch (err) {
                                $$.localStorage.setItem("u_language", get_language);
                                if(is_call_back) callback(get_language);
                            }
                        }else{
                            var langData = that.get_system_lang();
                            if(langData && is_call_back) callback(langData);
                        }
                    } catch (err) {
                        var langData_ = that.get_system_lang();
                        if(langData_ && is_call_back) callback(langData_);
                    }
                },true);
            }else {
                try {
                    $$.bridge.callHandler("native_handle", "localStorage_get_u_language", function (userLanguage) {
                        if (userLanguage) userLanguage = userLanguage["msg"];
                        try {
                            if (userLanguage) {
                                if (is_call_back) callback(userLanguage);
                            } else {
                                that.get_user_data(function (userData) {
                                    var user_info = userData["userInfo"];
                                    if (user_info) user_info = user_info["userInfo"];
                                    if (user_info && user_info["language"]) {
                                        $$.bridge.callHandler("native_handle", "localStorage_set_u_language:" + user_info["language"], function (result) {
                                            if (is_call_back) callback(user_info["language"]);
                                        });
                                    } else {
                                        if (is_call_back) callback("no data");
                                    }
                                });
                            }
                        } catch (err) {
                            if (is_call_back) callback("no data");
                        }
                    });
                } catch (err) {
                    var userLanguage = $$.localStorage.getItem("u_language");
                    try {
                        if (userLanguage) {
                            if (is_call_back) callback(userLanguage);
                        } else {
                            that.get_user_data(function (userData) {
                                var user_info = userData["userInfo"];
                                if (user_info) user_info = user_info["userInfo"];
                                if (user_info && user_info["language"]) {
                                    $$.localStorage.setItem("u_language", user_info["language"]);
                                    if (is_call_back) callback(user_info["language"]);
                                } else {
                                    if (is_call_back) callback("no data");
                                }
                            });
                        }
                    } catch (err) {
                        that.get_system_lang(function(langData){
                            if(langData){
                                if(is_call_back) callback(langData);
                                return;
                            }
                            if(is_call_back) callback("no data");
                        });
                    }
                }
            }
        },
        get_user_info : function(callback){
            var is_call_back = (typeof(callback) != "undefined" && typeof(eval(callback)) == "function");
            try{
                $$.bridge.callHandler("native_handle","localStorage_get_user_info",function(data1){
                    data1 = data1["msg"];
                    try {
                        if(data1) {
                            data1 = JSON.parse(decodeURIComponent(data1));
                            if (is_call_back) callback(data1);
                        }else{
                            if (is_call_back) callback("no data");
                        }
                    }catch (err){
                        if (is_call_back) callback("no data");
                    }
                });
            }catch (err){
                var user_info = $$.localStorage.getItem("user_info");
                try {
                    //user_info = JSON.parse(user_info);
                    if(user_info) {
                        if (is_call_back) callback(user_info);
                    }else{
                        if (is_call_back) callback("no data");
                    }
                }catch (err){
                    if (is_call_back) callback("no data");
                }
            }
        },
        get_user_data : function(callback,bool){
            var is_call_back = (typeof(callback) != "undefined" && typeof(eval(callback)) == "function");
            if(bool){
                net.init_user_data(function(result){
                    if (is_call_back) callback(result);
                });
                return;
            }
            try{
                $$.bridge.callHandler("native_handle","localStorage_get_init_user_data",function(data){
                    if(!data["msg"]){
                        net.init_user_data(function(result){
                            if (is_call_back) callback(result);
                        });
                    }else{
                        if (is_call_back) callback(JSON.parse(decodeURIComponent(data["msg"])));
                    }
                });
            }catch (err){
                var init_user_data = $$.localStorage.getItem("init_user_data");
                if(!init_user_data){
                    net.init_user_data(function(result){
                        if (is_call_back) callback(result);
                    });
                }else{
                    if (is_call_back) callback(JSON.parse(decodeURIComponent(init_user_data)));
                }
            }
        },
        get_access_token : function(callback){
            var is_call_back = (typeof(callback) != "undefined" && typeof(eval(callback)) == "function");
            try{
                $$.bridge.callHandler("native_handle","localStorage_get_access_token",function(token){
                    token = token["msg"];
                    try {
                        if(token) {
                            if (is_call_back) callback(token);
                        }else{
                            if (is_call_back) callback("no data1");
                        }
                    }catch (err){
                        if (is_call_back) callback("no data2");
                    }
                });
            }catch (err){
                var user_token = $$.localStorage.getItem("access_token");
                try {
                    if(user_token) {
                        if (is_call_back) callback(user_token);
                    }else{
                        if (is_call_back) callback("no data3");
                    }
                }catch (err){
                    if (is_call_back) callback("no data4");
                }
            }
        },
        html : function(str){
            this.innerHTML = str;
        },
        ajax: function (options) {
            options = options || {};
            options.type = (options.type || "GET").toUpperCase();
            options.dataType = options.dataType || "json";
            options.withCredentials = options.withCredentials?true:false;
            options.encrypt = options.encrypt || false;
            var params = options.encrypt?this.parameter_handle(options.data,net.serverkey):options.data;
            params = this.formatParams(params);

            //创建 - 非IE6 - 第一步
            if (window.XMLHttpRequest) {
                var xhr = new XMLHttpRequest();
            } else { //IE6及其以下版本浏览器
                var xhr = new ActiveXObject('Microsoft.XMLHTTP');
            }

            //接收 - 第三步
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    var status = xhr.status;
                    if (status >= 200 && status < 300) {
                        options.success && options.success(xhr.responseText, xhr.responseXML);
                    } else {
                        options.fail && options.fail(status);
                        if(status=="0"){
                            //loading("网络检查中");
                            try {
                                //$$.bridge.callHandler('native_handle', 'check_GFW');
                            }catch(err){}
                        }
                    }
                }
            };

            //是否开启跨域访问COOKIE验证 默认:关闭
            xhr.withCredentials = options.withCredentials;
            //console.log("xhr.withCredentials="+xhr.withCredentials);

            //连接 和 发送 - 第二步
            if (options.type == "GET") {
                xhr.open("GET", options.url + "?" + params, true);
                xhr.send(null);
            } else if (options.type == "POST") {
                xhr.open("POST", options.url, true);
                //设置表单提交时的内容类型
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xhr.send(params);
            }
        },

        //格式化参数
        formatParams: function (data) {
            var arr = [];
            for (var name in data) {
                arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
            }
            //arr.push(("v=" + Math.random()).replace(".", ""));
            return arr.join("&");
        },
        //是否是JSON格式
        isJSON : function(str, pass_object) {
            if (pass_object && isObject(str)) return true;

            if (!this.isString(str)) return false;

            str = str.replace(/\s/g, '').replace(/\n|\r/, '');

            if (/^\{(.*?)\}$/.test(str))
                return /"(.*?)":(.*?)/g.test(str);

            if (/^\[(.*?)\]$/.test(str)) {
                return str.replace(/^\[/, '')
                    .replace(/\]$/, '')
                    .replace(/},{/g, '}\n{')
                    .split(/\n/)
                    .map(function (s) { return isJSON(s); })
                    .reduce(function (prev, curr) { return !!curr; });
            }

            return false;
        },
        isString : function(val) {
            return typeof val === 'string';
        },
        load_js : function(src,callback){
            var set_src = src.split(",");
            var load_num = 0;
            var len = set_src.length;
            for(var i=0;i<set_src.length;i++) {
                var js = document.createElement("script");
                js.src = set_src[i];
                document.head.appendChild(js);
                if(typeof(callback) != "undefined" && typeof(eval(callback)) == "function"){
                    js.onload = function(){
                        ++load_num;
                        //全部加载完毕
                        if(load_num===len){
                            callback();
                        }
                    }
                }
            }
        },
        load_css : function(href,callback){
            var set_href = href.split(",");
            var load_num = 0;
            for(var i=0;i<set_href.length;i++) {
                var css = document.createElement("link");
                css.href = set_href[i];
                css.rel  = "stylesheet";
                css.type = "text/css";
                document.head.appendChild(css);
                if(typeof(callback) != "undefined" && typeof(eval(callback)) == "function"){
                    css.onload = function(){
                        ++load_num;
                        //全部加载完毕
                        if(load_num===set_href.length){
                            callback();
                        }
                    }
                }
            }
        },
        //JSON配置文件验证
        verification_config : function(json_str){
            //是否为空
            if(!json_str){
                console.log("返回data为空!");
                return false;
            }
            //是否JSON格式字符串
            if(typeof json_str === "object" || !this.isJSON(json_str)){
                console.log("返回data不是json格式字符串!");
                return false;
            }
            json_str = JSON.parse(json_str);
            //核对版本号
            if(!json_str["version"] || this.get_version()!==json_str["version"]){
                console.log("配置文件版本号不一致!"+json_str["version"]);
                return false;
            }
            //必须项目是否为空
            if(!json_str["skin_dir"] ||
                !json_str["initial_page"] ||
                !json_str["login_page"]
            ){
                console.log("返回data必选参数缺失!");
                return false;
            }

            return true;
        },
        eval_js_str : function(js_str){
            eval(js_str);
        },
        add_style : function(css_str,id){
            var css = document.createElement("style");
            css.innerHTML = css_str;
            if(id) css.id = id+"_css";
            document.head.appendChild(css);
        },
        GetQueryString : function(name)
        {
            var result = location.search.match(new RegExp("[\?\&]" + name+ "=([^\&]+)","i"));
            if(result == null || result.length < 1){
                return '';
            }
            return result[1];
        },
        cleanWhitespace: function(obj) {
            if (obj) {
                for (var i = 0; i < obj.childNodes.length; i++) {
                    var node = obj.childNodes[i];
                    if (node.nodeType == 3 && !/\S/.test(node.nodeValue)) {
                        node.parentNode.removeChild(node)
                    }
                }
            }
        },
        remove: function(obj) {
            obj && obj.parentNode ? obj.parentNode.removeChild(obj) : []
        },
        findObj : function(e,className){
            var tag = e.target;
            var that = this;
            var str = className?className:"touch-event";
            var result_obj;
            var max_find = 10;
            var find_num = 1;
            if(tag && tag.className && tag.className.indexOf(str)>=0){
                result_obj = tag;
            }else{
                //往下找
                //if(tag.innerHTML.indexOf(str)>0) down_find(tag);
                //往上找
                if(tag && tag.parentNode) up_find(tag.parentNode);
            }

            return result_obj;

            function up_find(e){
                try {
                    if(find_num<max_find) {
                        if (e && e.className && e.className.indexOf(str) >= 0) {
                            result_obj = e;
                            find_num = 0;
                        } else {
                            find_num++;
                            if(e && e.parentNode) up_find(e.parentNode);
                        }
                    }
                }catch (err) {
                    console.log(err);
                }
            }

            function down_find(obj) {
                try {
                    that.cleanWhitespace(obj);
                    for (var i in obj.childNodes) {
                        if (obj.childNodes[i].className &&
                            obj.childNodes[i].className.indexOf(str) >= 0) {
                            return tag.childNodes[i];
                        } else {
                            down_find(obj.childNodes[i]);
                        }
                    }
                }catch (err) {
                    console.log(err);
                }
            }
        },
        del: function(obj) {
            obj && obj.parentNode ? obj.parentNode.removeChild(obj) : []
        },
        before: function(obj,item) {
            obj.parentNode.insertBefore(item, obj);
        },
        after: function(obj,item) {
            this.cleanWhitespace(obj.parentNode);
            if (obj.nextSibling) {
                obj.parentNode.insertBefore(item, obj.nextSibling);
            }else{
                obj.parentNode.appendChild(item);
            }
        },
        set_touch_id : function(bool){
            if(bool){
                //开启
                try {
                    $$.bridge.callHandler('native_handle', 'localStorage_set_touch_id_state:true');
                }catch (err){
                    localStorage.setItem("touch_id_state",true);
                }
            }else{
                //关闭
                try {
                    $$.bridge.callHandler('native_handle', 'localStorage_set_touch_id_state:false');
                }catch (err){
                    localStorage.setItem("touch_id_state",false);
                }
            }
        },
        get_touch_id : function(callback){
            var is_call_back = (typeof(callback) != "undefined" && typeof(eval(callback)) == "function");
            try {
                $$.bridge.callHandler('native_handle', 'localStorage_get_touch_id_state',function(request){
                    if(request["msg"] == "true" || request["msg"]){
                        if(is_call_back) callback(true);
                    }else{
                        if(is_call_back) callback(false);
                    }
                });
            }catch (err){
                if(localStorage.getItem("touch_id_state")){
                    if(is_call_back) callback(true);
                }else{
                    if(is_call_back) callback(false);
                }
            }
        },
        appendHtml : function (obj,str){
            try {
                var div = document.createElement("div");
                div.innerHTML = str;
                obj.appendChild(div);
                this.cleanWhitespace(div);
                var str_obj = div.childNodes[0];
                obj.appendChild(str_obj);
                this.del(div);
            }catch (err){
                console.log(err);
            }
        },
        addClass : function(obj,str){

            this.removeClass(obj,str);

            try {
                if(obj) {
                    if (obj.className) {
                        obj.className += " " + str;
                    } else {
                        obj.className = str;
                    }
                }
            }catch (err) {
                console.log(err);
            }
        },
        removeClass : function(obj,str){
            try {
                if (obj && obj.className) {
                    if (obj.className.indexOf(" " + str) >= 0) {
                        obj.className = obj.className.replace(" " + str, "");
                    } else if (obj.className.indexOf(str+" ") >= 0) {
                        obj.className = obj.className.replace(str+" ", "");
                    } else if (obj.className == str) {
                        obj.removeAttribute("class");
                    }
                }
            }catch (err) {
                console.log(err);
            }
        },
        /**
         * localStorage缓存
         **/
        localStorage : {
            get_obj : function(){
                var obj = document.getElementById("local_storage_iframe");
                if(!obj){
                    obj = document.createElement("iframe");
                    obj.id = "local_storage_iframe";
                    obj.style.opacity = 0;
                    obj.style.display = "none";
                    document.body.appendChild(obj);
                }
                return obj.contentWindow.localStorage;
            },
            removeItem : function(key){
                this.get_obj().removeItem(key);
            },
            getItem : function(key){
                return JSON.parse(window.localStorage.getItem(key));
            },
            setItem : function(key,val){
                this.get_obj().setItem(key,JSON.stringify(val));
            },
            clear : function(){
                this.get_obj().clear();
            }
        },
        /**
         * sessionStorage缓存
         **/
        sessionStorage : {
            removeItem : function(key){
                window.sessionStorage.removeItem(key);
            },
            getItem : function(key){
                return window.sessionStorage.getItem(key);
            },
            setItem : function(key,val){
                window.sessionStorage.setItem(key,val);
            },
            clear : function(){
                window.sessionStorage.clear();
            }
        },
        /**
         * cookie缓存
         **/
        cookie : {
            removeItem : function(key){
                var exp = new Date();
                exp.setTime(exp.getTime() - 1);
                var cval=getCookie(key);
                if(cval!=null) document.cookie= key + "="+cval+";expires="+exp.toGMTString();
            },
            getItem : function(key){
                var arr,reg=new RegExp("(^| )"+key+"=([^;]*)(;|$)");
                if(arr=document.cookie.match(reg))
                    return unescape(arr[2]);
                else
                    return null;
            },
            setItem : function(key,val,time){
                var _time = time?time:24*60*60*1000;
                var exp = new Date();
                exp.setTime(exp.getTime() + _time);
                document.cookie = key + "="+ escape (val) + ";expires=" + exp.toGMTString();
            },
            clear : function(){
                var keys=document.cookie.match(/[^ =;]+(?=\=)/g);
                if (keys) {
                    for (var i = keys.length; i--;)
                        document.cookie=keys[i]+'=0;expires=' + new Date( 0).toUTCString()
                }
            }
        },
        //手机验证
        tel_check : function(tel_no,country){
            if(!tel_no) return "不能为空";
            if(!country) country = "+86";
            console.log("中国手机号码验证");
            if(country == "+86"){ //中国手机号码验证
                /*

                 移动号段：  134 135 136 137 138 139 147 148 150 151 152 157 158 159 172 178 182 183 184 187 188 198
                 联通号段：  130 131 132 145 146 155 156 166 171 175 176 185 186
                 电信号段：  133 149 153 173 174 177 180 181 189 199
                 虚拟运营商: 170
                 */
                /**************************************** 简单验证 ****************************************/
                //长度验证
                var len = tel_no.length;
                if(len==0){
                    return "不能为空";
                }
                if(len!==11){
                    return "长度不对";
                }
                if(
                    //第一位验证
                tel_no.substring(0,1)!=="1" ||
                    //第二位验证
                tel_no.substring(1,2)=="2" ||
                tel_no.substring(1,2)=="6" ||
                tel_no.substring(1,2)=="7" ||
                    //是否全为数字
                isNaN(tel_no)
                ){
                    return "有误";
                }
                if(
                    //特殊号码检测
                    special_check(tel_no)
                ){
                    return "特殊号码";
                }

                //返回正确
                return false;
            }

            function special_check(str){
                var check_str = str.substring(3,11);
                //第4位开始，重复数字超过5位
                var a = '';
                for(var i=0;i<10;i++){
                    a = check_str.replace(eval("/"+i+"/g"),'');
                    if(a.length <= 3) return true;
                }
                //第4位开始，是否有5位以上顺子
                var b = false;
                for(var j=0;j<8;j++){
                    //console.log(check_str.substring(j,j+5));
                    b = shun(check_str.substring(j,j+5));
                    //console.log(b);
                    if(b) break;
                }
                return b;
            }
            function shun(str){
                if(str.length==5) {
                    var str_asc = str.replace(/\d/g, function ($0, pos) {
                        return parseInt($0) - pos;
                    });
                    var str_desc = str.replace(/\d/g, function ($0, pos) {
                        return parseInt($0) + pos;
                    });
                    if (/^(\d)\1+$/.test(str_asc)) return true; //顺增
                    if (/^(\d)\1+$/.test(str_desc)) return true; //顺减
                }
                return false;
            }
        },
        //邮箱验证
        email_check : function(email_no,callback){
            var that = this;
            if(!email_no) return false;
            if(email_no.indexOf("@")<=0) return false;
            var email_reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
            if(!email_reg.test(email_no)) return "无效的邮箱";
            //检查mx记录
            try{
                if(typeof(callback) != "undefined" && typeof(eval(callback)) == "function"){
                    that.ajax({
                        url : "https://",
                        type : "POST",
                        success : function(data){
                            return callback(data.code);
                        },
                        fail : function(){
                            return callback(true);
                        }
                    });
                }else{
                    return true;
                }
            }catch(err){}
        },
        //密码复杂度检查
        pass_check : function(pass){
            //密码为字母、数字、字符中至少2种组合，至少8个字符，最多32个字符
            if(pass.toString().length>32) return false;
            var regex = new RegExp('(?=.*[0-9])(?=.*[a-zA-Z])|(?=.*[0-9])(?=.*[^a-zA-Z0-9])|(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,32}');
            return regex.test(pass.toString());
        },
        //路由查询
        route_search : function(pages){
            var result = {};
            var p = 0;
            var c = 0;
            var routes = window.appConfig["controller_list"];
            if(routes){
                result["parent_page"] = [];
                result["child_pages"] = [];
                for(var i in routes){
                    var service_name = routes[i]["service_name"];
                    var parent_view = routes[i]["parent_view"];
                    if(service_name == pages){
                        result["parent_page"][p] = parent_view;
                        p++;
                    }
                    if(parent_view == pages){
                        result["child_pages"][c] = service_name;
                        c++;
                    }
                }
                return result;
            }else{
                console.log("路由信息不存在!");
            }
        },
        /**
         * 新型页面切换
         * go :目的页面
         * type : 切换方式 right-center 右边隐藏滑入当前可见视图 同时会执行：当前视图滑出左边隐藏
         *                bottom-center 底部隐藏滑入当前可见视图 同时会执行：当前视图按兵不动并隐藏
         * data : 传参,可以是json也可以是字符串
         * callback : 回调
         * **/
        push_view_controller : function(go,type,data,callback){

            var that = this;

            try {
                if (that.localStorage.getItem("is_pop_view_controller")){
                    console.log("pop is ing ,6秒后删除");
                    //alert("pop is ing ,6秒后删除");
                    if(window.delay_push_pop) clearTimeout(window.delay_push_pop);
                    window.delay_push_pop = setTimeout(function(){
                        that.localStorage.removeItem("is_pop_view_controller");
                    },6000);
                    return;
                }
                that.localStorage.setItem("is_push_view_controller", "true");

                var self = that.obj(".state-center-show");
                if (self.length !== 1){
                    console.log("state-center-show 存在"+self.length+"个");
                    for(var s = 0;s<self.length-1;s++){
                        that.removeClass(self[s], "state-center-show");
                        that.addClass(self[s], "state-center-hide");
                    }
                    console.log("多余的 state-center-show 已经处理掉");
                    self = that.obj(".state-center-show");
                }
                self = that.obj("#" + self[0].id);
                //首先组装新页面
                try {
                    //如果存在 则删除
                    if(that.obj("#"+go)) that.del(that.obj("#"+go));
                }catch (err){
                    console.log(err);
                }
                that.init_page(go, type, function (code) {
                    if (code) {
                        that.localStorage.removeItem("is_push_view_controller");
                        alert("111"+code);
                        return;
                    }
                    var obj_go = that.obj("#" + go);
                    if (!obj_go){
                        console.log("对象 obj_go 不存在");
                        alert("对象 obj_go 不存在");
                        return;
                    }
                    //动画前执行
                    try {
                        if (typeof(eval("new $$." + go + "().prev_load")) == "function") eval("new $$." + go + "().prev_load(data)");
                    } catch (err) {
                        console.log(err);
                    }
                    //设置动画速度
                    try {
                        if (type === "right-center")
                            self.style.webkitTransition = "all .6s cubic-bezier(1,.5,1,.07)";
                        obj_go.style.webkitTransition = "all .4s cubic-bezier(.15,.39,.08,.82)";
                    } catch (e) {
                        console.log(e);
                    }
                    //维持历史页面路由
                    try {
                        window.history_route[go.toString()] = [self.id.toString(), type.toString()];
                    } catch (e) {
                        console.log(e);
                    }
                    //开始动画
                    setTimeout(function () {
                        try {
                            if (type === "right-center") {
                                obj_go.style.webkitTransform = "translate3d(0,0,0)";
                                self.style.webkitTransform = "translate3d(-100%,0,0)";
                            } else if (type === "bottom-center") {
                                obj_go.style.webkitTransform = "translate3d(0,0,0)";
                            }
                        } catch (err) {
                            console.log(err);
                        }
                    }, 80);
                    setTimeout(function () {
                        try {
                            if (type === "right-center") {
                                that.addClass(obj_go, "state-center-show");
                                that.removeClass(obj_go, "state-right");
                                that.addClass(self, "state-left");
                                that.removeClass(self, "state-center-show");
                                self.removeAttribute("style");
                                obj_go.removeAttribute("style");
                            } else if (type === "bottom-center") {
                                that.addClass(obj_go, "state-center-show");
                                that.removeClass(obj_go, "state-bottom");
                                that.removeClass(self, "state-center-show");
                                that.addClass(self, "state-center-hide");
                                self.removeAttribute("style");
                                obj_go.removeAttribute("style");
                            }
                        } catch (err) {
                            console.log(err);
                        }
                        try {
                            that.localStorage.removeItem("is_push_view_controller");
                        } catch (err) {
                        }
                        try {
                            that.un_disabled_input(obj_go);
                        } catch (err) {
                        } //解除键盘输入框禁止
                        try {
                            if (typeof(eval("new $$." + go + "().load")) == "function") eval("new $$." + go + "().load(data)");
                        } catch (err) {
                        }
                        try {
                            if (typeof(callback) != "undefined" && typeof(eval(callback)) == "function") callback();
                        } catch (err) {
                        }
                        try {
                            var config = {duration: 500, delay: 200};
                            Waves.attach(".waves-event", ['waves-circle']);
                            Waves.init(config);
                        } catch (err) {
                        }
                        /*
                         * .waves-button 用于半圆形按钮样式。
                         .waves-float 单击元素时的浮动效果。
                         .waves-circle 圆形（圆形）样式。
                         .waves-block添加到元素。  display: block;
                         * */
                    }, 700);
                });
            }catch (err){
                confirm(err);
            }
        },
        /**
         * 页面返回
         * */
        pop_view_controller : function(data,callback){

            var that = this;
            try {

                if (that.localStorage.getItem("is_push_view_controller")){
                    console.log("push is ing ,6秒后删除");
                    if(window.delay_push_pop) clearTimeout(window.delay_push_pop);
                    window.delay_push_pop = setTimeout(function(){
                        that.localStorage.removeItem("is_push_view_controller");
                    },6000);
                    return;
                }
                that.localStorage.setItem("is_pop_view_controller", "true");

                //找到当前页面
                var self = that.obj(".state-center-show");
                if (self.length !== 1){
                    console.log("state-center-show 存在"+self.length+"个");
                    for(var s = 0;s<self.length-1;s++){
                        that.removeClass(self[s], "state-center-show");
                        that.addClass(self[s], "state-center-hide");
                    }
                    console.log("多余的 state-center-show 已经处理掉");
                    self = that.obj(".state-center-show");
                }
                self = that.obj("#" + self[0].id);
                //找到历史页面
                var history_data = window.history_route[self.id.toString()];
                if (history_data && history_data[0] && history_data[1]) {
                    var page = history_data[0];
                    var type = history_data[1];
                    var obj_back = that.obj("#" + page);
                    //设置动画速度
                    obj_back.style.zIndex = "0";
                    obj_back.style.display = "block";
                    if (type === "right-center") {
                        obj_back.style.webkitTransition = "all .4s cubic-bezier(.15,.39,.08,.82)";
                    }
                    self.style.webkitTransition = "all .4s cubic-bezier(.15,.39,.08,.82)";
                    //删除该历史页面路由
                    try {
                        delete(window.history_route[self.id.toString()]);
                    } catch (e) { console.log(e);}
                    //开始动画
                    setTimeout(function () {
                        if (type === "right-center") {
                            obj_back.style.webkitTransform = "translate3d(0,0,0)";
                            self.style.webkitTransform = "translate3d(100%,0,0)";
                        } else if (type === "bottom-center") {
                            obj_back.style.webkitTransform = "translate3d(0,0,0)";
                            self.style.webkitTransform = "translate3d(0,100%,0)";
                        }
                    }, 80);
                    setTimeout(function () {
                        try {
                            if (type === "right-center") {
                                that.addClass(obj_back, "state-center-show");
                                that.removeClass(obj_back, "state-left");
                                that.addClass(self, "state-right");
                                that.removeClass(self, "state-center-show");
                                self.removeAttribute("style");
                                obj_back.removeAttribute("style");
                            } else if (type === "bottom-center") {
                                that.addClass(obj_back, "state-center-show");
                                that.removeClass(obj_back, "state-center-hide");
                                that.removeClass(self, "state-center-show");
                                that.addClass(self, "state-bottom");
                                self.removeAttribute("style");
                                obj_back.removeAttribute("style");
                            }
                        } catch (err) { console.log(err);}
                        try {
                            that.localStorage.removeItem("is_pop_view_controller");
                        } catch (err) { console.log(err);}
                        try {
                            if (typeof(eval("new $$." + obj_back.id + "().pop_callback")) == "function") eval("new $$." + obj_back.id + "().pop_callback(data)");
                        } catch (err) { console.log(err);}
                        try {
                            if (typeof(callback) != "undefined" && typeof(eval(callback)) == "function") callback();
                        } catch (err) { console.log(err);}
                        try {
                            //销毁页面
                            $$.del($$.obj("#" + self.id + "_css")); //销毁css
                            $$.del(self); //销毁html
                        } catch (err) {
                            console.log("销毁页面失败");
                            console.log(err);
                        }
                        for (var key in $$) {  //销毁js
                            try {
                                if (key.toString() == self.id.toString()) {
                                    delete($$[key]);
                                    return;
                                }
                            } catch (err) { console.log(err); }
                        }
                    }, 700);
                } else {
                    console.log("没有找到 " + self + " 的历史页面");
                }
            }catch (err){
                console.log(err);
            }
        },
        /**
         * 页面切换
         * obj  : 需要切换的目的页面JS对象
         * to   : self 当前页面  $$.obj("#page2") 其他页面
         * type : default 从下到上 push 从右到左
         * **/
        push_view_controller2 : function(options,callback){
            var that = this;
            options = {
                obj  : options.obj || null,
                from : options.from,
                to   : options.to
            };

            try{
                if(typeof(eval(options.obj.prev_load))=="function") options.obj.prev_load();
            }catch(err){
                console.log(err);
            }

            if(options.to.parentNode.id === "right_view") {

                if(options.from.parentNode.id == "bottom_view" && options.from.parentNode !== options.to.parentNode){
                    options.to.parentNode.style.zIndex = 3;
                }

                //如果参与左右切换效果的2个页面均有顶部菜单栏
                if(
                    (
                        options.from.parentNode.id == "main_view" && options.from.getElementsByClassName("fragment-list-active")[0] && options.from.getElementsByClassName("fragment-list-active")[0].getElementsByTagName("header")[0] || //如果是根视图,当前active页面的头部是否存在
                        options.from.parentNode.id !== "main_view" && options.from.getElementsByTagName("header")[0]   //或者不是根视图,当header存在
                    )
                    &&
                    (
                        options.to.parentNode.id == "main_view" && options.to.getElementsByClassName("fragment-list-active")[0].getElementsByTagName("header")[0] || //如果是根视图,当前active页面的头部是否存在
                        options.to.parentNode.id !== "main_view" && options.to.getElementsByTagName("header")[0]
                    )
                ) {
                    that.addClass(options.from, "part");
                    that.addClass(options.to, "part");
                }else{
                    that.removeClass(options.from, "part");
                    that.removeClass(options.to, "part");
                }

                //执行动画
                setTimeout(function () {

                    that.removeClass(options.from,"center");
                    that.removeClass(options.from,"in");
                    that.removeClass(options.from,"out");
                    that.addClass(options.from,"left out");
                    that.addClass(options.to.parentNode,"view-controller-visible");
                    that.removeClass(options.to,"right");
                    that.removeClass(options.to,"in");
                    that.removeClass(options.to,"out");
                    that.addClass(options.to,"center in");
                    setTimeout(function(){
                        if(options.from.parentNode !== options.to.parentNode) that.removeClass(options.from.parentNode,"view-controller-visible");
                        options.to.parentNode.removeAttribute("style");
                    },600);

                }, 5);
            }

            if(options.to.parentNode.id === "bottom_view") {
                //执行动画
                setTimeout(function () {

                    that.addClass(options.to.parentNode,"view-controller-visible");
                    that.removeClass(options.to,"bottom");
                    that.removeClass(options.to,"part");
                    that.removeClass(options.to,"out");
                    that.removeClass(options.to,"in");
                    that.addClass(options.to,"center in");
                    setTimeout(function(){
                        if(options.from.parentNode !== options.to.parentNode) that.removeClass(options.from.parentNode,"view-controller-visible");
                        //that.removeClass(options.from,"center");
                        that.removeClass(options.from,"in");
                        that.removeClass(options.from,"out");
                        that.removeClass(options.from,"part");
                        //that.addClass(options.from,"bottom");
                    },600);

                }, 5);
            }

            setTimeout(function(){
                try{
                    if(typeof(eval(options.obj.load))=="function") options.obj.load();
                }catch(err){
                    console.log(err);
                }
                try{
                    $$.un_disabled_input(options.to); //解除键盘输入框禁止
                }catch(err){
                    console.log(err);
                }
                if(typeof(callback) != "undefined" && typeof(eval(callback)) == "function") callback();
            },650);
        },
        /**
         * 返回上一页
         * back : self 当前页面  $$.obj("#page1") 其他页面
         * from   : self 当前页面  $$.obj("#page2") 其他页面
         * **/
        pop_view_controller_2 : function(options,callback){
            var that = this;
            options = {
                obj  : options.obj || null,
                from   : options.from,
                back : options.back //that.obj("#"+that.route_search(options.from.id.replace(/\\-/g,'_'))["parent_page"][0].replace(/\\-/g,'_'))
            };

            //判断当前页面
            switch (options.from.parentNode.id){
                case  "right_view":
                    //返回页
                    that.addClass(options.back.parentNode,"view-controller-visible");
                    that.removeClass(options.back,"left");
                    that.removeClass(options.back,"in");
                    that.removeClass(options.back,"out");
                    that.addClass(options.back,"center in");
                    //当前页
                    that.removeClass(options.from,"center");
                    that.removeClass(options.from,"in");
                    that.removeClass(options.from,"out");
                    that.addClass(options.from,"right in");
                    setTimeout(function(){
                        if(options.from.parentNode !== options.back.parentNode) that.removeClass(options.from.parentNode,"view-controller-visible");
                        that.removeClass(options.from,"in");
                        that.removeClass(options.from,"part");
                        that.removeClass(options.from,"out");
                    },600);

                    break;
                case  "bottom_view":
                    //返回页
                    that.addClass(options.back.parentNode,"view-controller-visible");
                    that.removeClass(options.back,"bottom");
                    that.removeClass(options.back,"left");
                    that.removeClass(options.back,"in");
                    that.removeClass(options.back,"part");
                    that.addClass(options.back,"center");
                    //当前页
                    that.removeClass(options.from,"center");
                    that.removeClass(options.from,"in");
                    that.removeClass(options.from,"part");
                    that.addClass(options.from,"bottom in");
                    setTimeout(function(){
                        if(options.from.parentNode !== options.back.parentNode) that.removeClass(options.from.parentNode,"view-controller-visible");
                        that.removeClass(options.from,"in");
                    },600);

                    break;
                default:
                //
            }


            setTimeout(function(){
                try{
                    if(typeof(eval(options.obj.callback))=="function") options.obj.callback();
                }catch(err){
                    console.log(err);
                }
                try{
                    $$.disabled_input(options.from); //禁止键盘输入框
                }catch(err){
                    console.log(err);
                }
                if(typeof(callback) != "undefined" && typeof(eval(callback)) == "function") callback();
            },650);
        },
        /**
         * 参数加密处理
         * data json对象
         * serverkey 服务器公钥
         * **/
        parameter_handle : function(data,serverkey){
            var new_data = {};
            var that = this;
            //得到 aes key
            var get_key = that.aes_key_create(15);
            //对aes key进行rsa加密 用服务器公钥
            var aes_key = that.rsa_encrypt(get_key,serverkey);
            //进行key-value aes加密
            for(var key in data){
                var _key = that.aes_encrypt(key,get_key);
                var _val = that.aes_encrypt(data[key],get_key);
                new_data[encodeURIComponent(_key)] = encodeURIComponent(_val);
            }
            //根据aes加密后的新对象得到签名
            var sign = that.sign(new_data);
            new_data[encodeURIComponent("sign")] = encodeURIComponent(sign);
            new_data[encodeURIComponent("aeskey")] = encodeURIComponent(aes_key);
            new_data[encodeURIComponent("pubkey")] = encodeURIComponent(appConfig["pubkey"]);
            new_data[encodeURIComponent("isencrypt")] = encodeURIComponent("true");
            return new_data;
        },
        /**
         * 得到md5签名
         * **/
        sign : function(json){
            //字典排序
            var sdic = Object.keys(json).sort();
            var md5_str = '';
            //组装字段
            for(var key in sdic){
                md5_str += [sdic[key]] + "=" + json[sdic[key]]+"&";
            }
            return md5(md5_str+"sign="+appConfig["key"]);
        },
        /**
         * 依赖版本 JSEncrypt v2.3.1
         * rsa 加密
         * encrypted 需要解密的字符串
         * **/
        rsa_encrypt : function(encrypted,pubkey){
            var encrypt = new JSEncrypt();
            encrypt.setPublicKey(pubkey);
            return encrypt.encrypt(encrypted);
        },
        /**
         * 依赖版本 JSEncrypt v2.3.1
         * rsa 解密
         * encrypted 需要解密的字符串
         * **/
        rsa_decrypt : function(encrypted){
            var decrypt = new JSEncrypt();
            decrypt.setPrivateKey(appConfig["privkey"]);
            return decrypt.decrypt(encrypted);
        },
        /**
         * 创建 随机 aes key
         * length 长度
         * **/
        aes_key_create : function(length){
            // 密码字符集，可任意添加你需要的字符
            var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var password = "";
            if(!length || length<5) length = 6;
            for (var i = 0; i < length; i++ )
            {
                password += chars[parseInt(Math.random()*(chars.length))];
            }
            return password;
        },
        /**
         * 加密 依赖版本 crypto 3.1.9
         * val : 需要加密的字符串(数组,JSON格式也可以)
         * secret : aes key
         * **/
        aes_encrypt : function(val,secret){
            var data = val;//加密字符串
            var key  = CryptoJS.enc.Latin1.parse(md5(secret).substr(8,16));//密钥
            var iv   = key;//与aes key保持一致
            //加密
            data = JSON.stringify(data);//将数据对象转换为json字符串
            var encrypted = CryptoJS.AES.encrypt(data,key,{iv:iv,mode:CryptoJS.mode.CBC,padding:CryptoJS.pad.ZeroPadding});
            encrypted = encrypted.toString();
            return encrypted; //输出加密后的字符串;
        },
        /**
         * 解密 依赖版本 crypto 3.1.9
         * encrypted 需要解密的字符串
         * secret : aes key
         * **/
        aes_decrypt : function(encrypted,secret){
            //key和iv和加密的时候一致
            var key  = CryptoJS.enc.Latin1.parse(md5(secret).substr(8,16));
            var iv   = key;
            var decrypted = CryptoJS.AES.decrypt(encrypted.toString(),key,{iv:iv,padding:CryptoJS.pad.ZeroPadding});
            decrypted = decrypted.toString(CryptoJS.enc.Utf8);
            return decrypted;//输出解密后的数据
        },
        /**
         * 数字键盘
         * */
        number_keyboard : function(attr,callback){
            var that = this;
            var keyboard;
            //UI生成
            if(!that.obj("#keyboard_tel")){
                keyboard = document.createElement("div");
                keyboard.id = "keyboard_tel";
                keyboard.className = "keyboard-tel";
                keyboard.innerHTML = '<ul class="keyboard-tel-left"> <li class="touch-event">1</li> <li class="touch-event">2</li> <li class="touch-event">3</li> <li class="touch-event">4</li> <li class="touch-event">5</li> <li class="touch-event">6</li> <li class="touch-event">7</li> <li class="touch-event">8</li> <li class="touch-event">9</li> <li class="touch-event">.</li> <li class="touch-event">0</li> <li class="touch-event keyboard-tel-dis">dis</li> </ul> <div class="keyboard-tel-right"> <div class="keyboard-tel-delete touch-event">del</div> <div class="keyboard-tel-sure touch-event">确定</div> </div>';
                document.body.appendChild(keyboard);
            }else{
                keyboard = that.obj("#keyboard_tel");
            }
            if(attr && attr==="show"){
                setTimeout(function(){
                    keyboard.style.webkitTransform = "translate3d(0,0,0)";
                },50);
            }
            if(attr && attr==="hide"){
                keyboard.style.webkitTransform = "translate3d(0,400px,0)";
                setTimeout(function(){
                    that.del(that.obj("#keyboard_tel"));
                },410);
                return;
            }
            //监听
            keyboard.onclick = function(){
                var the = that.findObj(event);
                try{
                    if(typeof(callback) != "undefined" && typeof(eval(callback)) == "function") callback(the);
                }catch (err){
                    console.log(err);
                }
            };
            //取消
            var keyboard_dis = keyboard.getElementsByClassName("keyboard-tel-dis");
            if(keyboard_dis){
                keyboard_dis = keyboard_dis[0];
                if(keyboard_dis) keyboard_dis.onclick = function(){
                    if(this.innerHTML == "dis") that.number_keyboard("hide");
                };
            }
        },
        //组合 C:all,b
        zu_he : function(all,b){
            var m_result = 1;
            var n_result = 1;
            for(var i=0;i<b;i++){
                m_result = m_result*(all-i);
                n_result = n_result*(b-i);
            }
            return parseInt(m_result/n_result);
        },
        //得到指定范围类随机不重复的整数数组
        random_int : function(to,len){
            var count=to;
            var original=[];
            var result = [];
            for (var i=0;i<count;i++){
                original[i]=i+1;
            }
            original.sort(function(){ return 0.5 - Math.random();});
            var init_i = parseInt(Math.random()*100)%(to-len);
            var n = 0;
            for (var i=init_i;i<len+init_i;i++){
                result[n] = original[i];
                n++;
            }
            return result;
        },
        //js-oc交互
        setupWebViewJavascriptBridge : function(callback) {
            if(typeof(callback) != "undefined" && typeof(eval(callback)) == "function") {
                if (window.WebViewJavascriptBridge) {
                    return callback(WebViewJavascriptBridge);
                }
                if (window.WVJBCallbacks) {
                    return window.WVJBCallbacks.push(callback);
                }
                window.WVJBCallbacks = [callback];
                var WVJBIframe = document.createElement('iframe');
                WVJBIframe.style.display = 'none';
                //WVJBIframe.src = e.indexOf("iOS ") == 0?'https://__bridge_loaded__':'wvjbscheme://__BRIDGE_LOADED__';
                WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
                document.documentElement.appendChild(WVJBIframe);
                setTimeout(function () {
                    document.documentElement.removeChild(WVJBIframe)
                }, 0);
            }
        },
        //解除输入框禁止令
        un_disabled_input : function(obj){
            var inputs = obj.getElementsByTagName("input");
            var textareas = obj.getElementsByTagName("textarea");
            for(var i=0;i<inputs.length;i++){
                if(inputs[i].type!=="hidden"){
                    inputs[i].removeAttribute("disabled");
                    inputs[i].addEventListener("focus",function(){
                        //处理键盘
                        try{
                            $$.bridge.callHandler('native_handle', "handle_keyword");
                        }catch (err){}
                    },false);
                }
            }
            for(var j=0;j<textareas.length;j++){
                if(textareas[j]){
                    textareas[j].removeAttribute("disabled");
                    textareas[i].addEventListener("focus",function(){
                        //处理键盘
                        try{
                            $$.bridge.callHandler('native_handle', "handle_keyword");
                        }catch (err){}
                    },false);
                }
            }
        },
        //禁止输入框
        disabled_input : function(obj){
            var inputs = obj.getElementsByTagName("input");
            var textareas = obj.getElementsByTagName("textarea");
            console.log("inputs.length="+inputs.length);
            for(var i=0;i<inputs.length;i++){
                if(inputs[i].type!=="hidden" && inputs[i].type!=="checkbox" && inputs[i].type!=="radio"){
                    inputs[i].setAttribute("disabled","disabled");
                }
            }
            for(var j=0;j<textareas.length;j++){
                if(textareas[j]){
                    textareas[j].setAttribute("disabled","disabled");
                }
            }
        },
        //初始化页面
        init_page : function(page_id,type,callback){
            var has_end = 0;
            //加载html页面
            $$.ajax({
                url: appConfig["service_dir"] + page_id + "/" + page_id + ".html?v="+new Date().getTime(),
                type: "GET",
                dataType: "text/html",
                success: function (data) {
                    try {
                        $$.appendHtml($$.obj("#view"),data);
                        var page_obj = $$.obj("#"+page_id);
                        switch (type){
                            case "default":
                                $$.addClass(page_obj,"state-center-show");
                                break;
                            case "right-center":
                                page_obj.style.zIndex = "2";
                                page_obj.style.webkitTransform = "translate3d(99.99999%,0,0)";
                                break;
                            case "bottom-center":
                                page_obj.style.zIndex = "2";
                                page_obj.style.webkitTransform = "translate3d(0,99.99999%,0)";
                                break;
                            default:
                        }
                        has_end = has_end + 1;
                        if(has_end===3 && typeof(callback) != "undefined" && typeof(eval(callback)) == "function") callback();

                        //加载js页面 必须在html之后
                        $$.ajax({
                            url: appConfig["service_dir"] + page_id + "/" + page_id + ".js?v="+new Date().getTime(),
                            type: "GET",
                            dataType: "text/html",
                            success: function (data) {
                                try {
                                    $$.eval_js_str(data);
                                    has_end = has_end + 1;
                                    if(has_end===3 && typeof(callback) != "undefined" && typeof(eval(callback)) == "function") callback();
                                } catch (err) {
                                    console.log(err);
                                }
                            }
                        });
                    } catch (err) {
                        console.log(err);
                        confirm(err);
                        if(typeof(callback) != "undefined" && typeof(eval(callback)) == "function") callback("err");
                    }
                },
                fail : function(){
                    //无网络下
                    if(typeof(callback) != "undefined" && typeof(eval(callback)) == "function") callback("no network");
                }
            });
            //加载css页面
            $$.ajax({
                url: appConfig["service_dir"] + page_id + "/" + page_id + ".css?v="+new Date().getTime(),
                type: "GET",
                dataType: "text/html",
                success: function (data) {
                    try {
                        $$.add_style(data,page_id);
                        has_end = has_end + 1;
                        if(has_end===3 && typeof(callback) != "undefined" && typeof(eval(callback)) == "function") callback();
                    } catch (err) {
                        console.log(err);
                    }
                }
            });
        },
        //将base64转换为文件
        dataURLtoFile : function(dataurl, filename) {
            var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while(n--){
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, {type:mime});
        },
        //将图片转换为Base64
        getImgToBase64 : function(url,callback){
            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d'),
                img = new Image;
            img.crossOrigin = 'Anonymous';
            img.onload = function(){
                canvas.height = img.height;
                canvas.width = img.width;
                ctx.drawImage(img,0,0);
                var dataURL = canvas.toDataURL('image/png');
                callback(dataURL);
                canvas = null;
            };
            img.src = url;
        },
        //**dataURL to blob**
        dataURLtoBlob : function(dataurl) {
            var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        },
        //**blob to dataURL**
        blobToDataURL : function(blob, callback) {
            var a = new FileReader();
            a.onload = function (e) { callback(e.target.result); }
            a.readAsDataURL(blob);
        },
        //格式化时间
        format_time : function(timer){
            if(timer.toString().length<13) return;
            var time = new Date(timer);
            var y = time.getFullYear();//年
            var m = time.getMonth() + 1;//月
            m = m<10?"0"+m:m;
            var d = time.getDate();//日
            d = d<10?"0"+d:d;
            var h = time.getHours();//时
            h = h<10?"0"+h:h;
            var mm = time.getMinutes();//分
            mm = mm<10?"0"+mm:mm;
            var s = time.getSeconds();//秒
            s = s<10?"0"+s:s;

            if(this.isToday(timer)) {
                return ("今日 " + h + ":" + mm + ":" + s);
            }else{
                return (y + "-" + m + "-" + d + " " + h + ":" + mm + ":" + s);
            }
        },
        isToday : function(str){
            var d = new Date(str);
            var todaysDate = new Date();
            if(d.setHours(0,0,0,0) == todaysDate.setHours(0,0,0,0)){
                return true;
            } else {
                return false;
            }
        },
        /**
         * number  需要格式化的数字
         * n 保留几位小数
         * bool false 或留空 不格式整数部分
         * return 返回字符串
         * */
        format_coin:function(number,n,bool){
            n=!n?8:n;
            var a=parseFloat(number).toString().split("."),
                b='',e=a[0],c=function(e){return"<font style=\"opacity:1;\">"+e+"</font>"};
            if(bool) if (a[0]) { e=''; for (var t = a[0].length - 1; t >= 0; t--) {if (a[0][t]) {var _ = (a[0].length - t) % 3 == 0 && t !== 0 ? ',' : '';e = _ + a[0][t] + e;}}}else{e = '0';}
            if(a[1]){
                for(var i=0;i<n;i++){
                    b+=i<a[1].length?parseInt(a[1])==0||parseInt(a[1].substring(0,n))==0?c(0):a[1][i]:c(0);
                }
                if(b.indexOf('font')<0&&parseFloat("0."+b).toString()!=="0."+b){
                    var d=b.substring(parseFloat("0."+b).toString().length-2,b.length);
                    b=parseFloat("0."+b).toString().replace('0.','');
                    for(var k=0;k<d.length;k++)b+=c(d[k])
                }
            }else{
                for(var j=0;j<n;j++) b+=c(0)
            }
            return parseInt(b)?e+"."+b:e+c('.')+b;
        },
        /**
         * 格式化为 亿、万，万亿
         * number  需要格式化的数字
         * n 保留几位小数
         * return 返回字符串
         * */
        format_large_number : function(num,n){
            if(num == 0 || !num) return 0;
            var moneyUnits = ["", "万", "亿", "万亿"];
            var dividend = 10000;
            var curentNum = num.toString(); //转换数字
            var curentUnit = moneyUnits[0];
            // 转换单位
            for (var i = 0; i <4; i++) {
                curentUnit = moneyUnits[i];
                if(this.strNumSize(curentNum)<5) break;
                curentNum = curentNum / dividend;
            }
            return this.format_coin(curentNum,n,true)+curentUnit;
        },
        strNumSize : function(tempNum){
            var stringNum = tempNum.toString();
            var index = stringNum.indexOf(".");
            var newNum = stringNum;
            if(index!=-1){
                newNum = stringNum.substring(0,index);
            }
            return newNum.length;
        },
        format_email : function(email){
            return email.substring(0, 5) + "***" + email.substring(email.indexOf("@"), email.length);
        },
        format_mobile : function(tel){
            return tel.substring(tel.indexOf(" ")+1, tel.indexOf(" ")+4) + "***" + tel.substring(tel.length-4, tel.length);
        },
        /**
         * 对 json 某属性进行排序
         * */
        order_by : function(jsonData,index,bool){
            if(typeof (jsonData[0][index]) == "string"){
                //按字母排序
                return jsonData.sort(function(a,b){
                    return bool?a[index].localeCompare(b[index]):b[index].localeCompare(a[index]);
                });
            }else {
                //按数字大小排序
                return jsonData.sort(function(a, b) {
                    return bool ? a[index] - b[index] : b[index] - a[index];
                });
            }
        },
        //根据数字得到应该返回的精度
        get_precision  : function(number){

            var result = 0;
            var _number = number*1000000;

            if(_number > 0){
                if(_number < 10*1000000) result = 3;
                else result = 2;
            }else{
                if(_number < 0.001*1000000,12) result = 8;
                else if(_number < 0.001*1000000,12) result = 6;
                else if(_number < 0.001*1000000,12) result = 4;
                else result = 2;
            }

            return result;
        },
        //处理百分比
        handle_percent : function(val){
            val = parseFloat(val);
            if(!val) return "0.00";
            var result = 0;
            var new_val = Math.abs(val);
            if(new_val<0.01){
                if(new_val<0.001) {
                    if(new_val<0.0001) {
                        result = "0.00";
                    }else{
                        result = val.toFixed(4);
                    }
                }else{
                    result = val.toFixed(3);
                }
            }else{
                result = val.toFixed(2);
            }
            return result > 0 ? "+"+result:result;
        }
    };
}();
