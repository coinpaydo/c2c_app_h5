(function(){
    load_js(
        "fastclick.js,"+
        "common.js,"+
        "sha256.js," +
        "tool.js",
        function() {
            FastClick.attach(document.body);
            window.$$ = new xiaoc();

            window.appConfig = {
                api_domain: "http://47.91.153.112",
                ips_list: ["11.46.5.179", "12.47.6.162","13.48.7.123"],
                version: "1.0.0"
            };

            $$.setupWebViewJavascriptBridge(function(bridge) {

                $$.bridge = bridge;

                //状态栏
                $$.bridge.callHandler("native_handle","black");


                //处理角标,与原生交互
                try {
                    $$.bridge.callHandler('native_handle', "SetApplicationIconBadgeNumber:0");
                } catch (err) {}

                //默认api地址设置
                try {
                    $$.bridge.callHandler('native_handle','localStorage_get_apiDomain',function(result){
                        if(result["err"] == 0 && result["code"] == 1 && result["msg"]){
                            window.appConfig["api_domain"] = decodeURIComponent(result["msg"]);
                        }else{
                            $$.bridge.callHandler('native_handle','localStorage_set_apiDomain:'+encodeURIComponent(window.appConfig["api_domain"]),function(){
                                //ip地址库设置
                                var ips = window.appConfig["ips_list"];
                                $$.bridge.callHandler('native_handle','localStorage_set_ips:'+ips.join(","),function(){});
                            });
                        }
                    });
                }catch (err){}

                //版本号设置
                try {
                    $$.bridge.callHandler('native_handle', "localStorage_set_appVersion:"+window.appConfig["version"]);

                    setTimeout(function(){
                        //自动升级
                        $$.bridge.callHandler('native_handle','check_version');
                    },3000);

                } catch (err) {}

                //开始
                try {
                    init(function(result){
                        event(result);
                    });
                } catch (err) {}

                //获取扫描结果
                try {
                    $$.bridge.registerHandler('call_back_js_scan',function(data,responseCallback){

                    loading("off");

                    //confirm(JSON.stringify(data));
                    //return;
                    if(data["msg"] === "cancel" || !data) {
                        //取消处理
                    }else{
                        //扫描成功
                        //confirm("扫描结果="+decodeURIComponent(data["msg"]));
                        if(!data["msg"]){
                            console.log("没有获取到任何扫描结果");
                            return;
                        }
                        try {
                            var json_data = JSON.parse(decodeURIComponent(data["msg"]));
                            window.key    = json_data["key"]?json_data["key"]:[];
                            window.secret = json_data["secret"]?json_data["secret"]:[];

                            //保存key,secret
                            $$.bridge.callHandler('native_handle','localStorage_set_apiKey:'+window.key);
                            $$.bridge.callHandler('native_handle','localStorage_set_apiSecret:'+window.secret);

                            handle_login(true);

                            alert("登录成功");

                            event(true);

                        }catch (err){
                            json_data = decodeURIComponent(data["msg"]);
                            console.log("json_data="+json_data);
                        }
                    }
                    //重新设置状态栏风格
                    setTimeout(function(){
                        $$.bridge.callHandler("native_handle","black");
                    },500);
                });
                } catch (err) {}

                change_ui();

                //请打开通知
                try {
                    $$.bridge.callHandler('native_handle', "local_msg_push:"+encodeURIComponent(JSON.stringify({
                            "title":"系统提示", //标题（可缺省）
                            "subtitle":"", //副标题（可缺省）
                            "content":"请打开通知权限接收新订单推送", //内容
                            "settimeout":1, //多久后触发此通知(大于0的正整数) 默认5秒（可缺省）
                            "badge":1 //角标（显示在桌面icon右上角的红色消息数）
                        })),function(data){
                        console.log(data["msg"]);
                    });
                } catch (err) {}

                //生命周期
                $$.bridge.registerHandler('call_back_js_AppActive',function(data,responseCallback){
                    //得到需要本地化的json格式数据
                    switch(data["state"].toString()){
                        case "1":   //程序将要进入后台(墓碑状态)/程序失去焦点
                            break;
                        case "2":   //程序进入后台
                            break;
                        case "3":   //程序将要进入前台/程序从后台回到前台
                            break;
                        case "4":   //程序内存警告，可能要终止程序
                            break;
                        case "5":   //程序进入前台/程序获取焦点
                            try {
                                setTimeout(function() {
                                    var current_menu_n = parseInt(localStorage.getItem("last_click_n"));
                                    $$.obj("#menu").getElementsByTagName("li")[current_menu_n].onclick();
                                },200);
                            }catch (err){confirm(err)}
                            break;
                        case "6":   //程序即将退出
                            break;
                    }
                });
            });

            //pc上调试
            if(!$$.bridge) {
                window.key = "79bde310f0e8472e8de333b225feee45";
                window.secret = "922b5b8f23e846cdb1e7a87ea33b6208";
                event(true);
            }
        }
    );

    //初始化
    function init(callback){
        //版本号设置
        try {
            $$.bridge.callHandler('native_handle', "localStorage_set_appVersion:"+window.appConfig["version"]);
            console.log("当前版本："+window.appConfig["version"]);
        } catch (err) {}
        //新增白名单,与原生交互
        try {
            $$.bridge.callHandler('native_handle', "localStorage_set_whitelist:"+encodeURIComponent("api.coinpay.do"),function(data){
                //console.log(data["msg"]);
                $$.bridge.callHandler('native_handle', "localStorage_get_whitelist",function(data){
                    //confirm(JSON.stringify(data["msg"]));
                });
            });
        } catch (err) {}
        //默认api地址设置
        try {
            $$.bridge.callHandler('native_handle','localStorage_get_apiDomain',function(result){
                if(result["err"] == 0 && result["code"] == 1 && result["msg"]){
                    window.appConfig["api_domain"] = decodeURIComponent(result["msg"]);
                    //alert("api_domain="+window.appConfig["api_domain"]);
                }else{
                    //alert(result+"ip地址库设置");
                    $$.bridge.callHandler('native_handle','localStorage_set_apiDomain:'+encodeURIComponent(window.appConfig["api_domain"]),function(){
                        //ip地址库设置
                        var ips = window.appConfig["ips_list"];
                        //var new_ips = [];
                        //for(var ip=0;ip<ips.length;ip++){
                        //  if(ips[ip]!==result) new_ips.push(ips[ip]);
                        // }
                        $$.bridge.callHandler('native_handle','localStorage_set_ips:'+ips.join(","),function(){
                            //window.appConfig["ips_list"] = ips;
                        });
                    });
                }

                //自动升级检测
                //$$.bridge.callHandler('native_handle','check_version');
            });
        }catch (err){}
        //登录状态检测
        try {
            $$.bridge.callHandler('native_handle', "localStorage_get_apiKey",function(data){
                if(!data || !data["msg"] || data["msg"].length!==32){
                    //未登录
                    handle_login(false);
                    callback(false);
                }else {
                    $$.bridge.callHandler('native_handle', "localStorage_get_apiSecret", function (data1) {
                        if(!data1 || !data1["msg"] || data1["msg"].length!==32){
                            //未登录
                            handle_login(false);
                            callback(false);
                        }else{
                            handle_login(true);
                            window.key    = data["msg"];
                            window.secret = data1["msg"];

                            callback(true);
                        }
                    });
                }
            });
        } catch (err) {}
    }

    //未登录
    function handle_login(isLogin){
        $$.obj(".login-page")[0].style.display = isLogin?"none":"block";
    }

    function change_ui(){
        try{
            $$.bridge.callHandler('native_handle', "screen_notch",function(data){
                //confirm(data["msg"][0]["height"]);
                if(data["msg"][0]["bool"]==true || data["msg"][0]["bool"]=="true"){
                    if(data["msg"][0]["brand"].indexOf("iphone")>=0) {
                        document.body.className = "iphoneX";
                    }else{
                        document.body.className = "androidX";
                    }
                }
            });
        }catch (err){}
    }
    function load_js(src,callback){
        var set_src = src.split(",");
        var load_num = 0;
        for(var i=0;i<set_src.length;i++) {
            var js = document.createElement("script");
            js.src = set_src[i];
            document.head.appendChild(js);
            if(callback && typeof callback == "function"){
                js.onload = function(){
                    ++load_num;
                    //全部加载完毕
                    if(load_num===set_src.length){
                        callback();
                    }
                }
            }
        }
    }

    function event(isLogin){

        //初始化数据
        try {
            var boxOutSelect = $$.obj("#boxOutSelect");
            var walletAllList = $$.obj("#walletAllList");
            loading();
            $$.ajax({
                url : "https://api.coinpay.do/pizza/gw/index/create",
                type : "GET",
                success : function(data){
                    data = JSON.parse(data);
                    if(data["err"] == "0"){
                        //币种列表
                        var li = '';
                        var coin_data = data["data"]["moneyType"];
                        for(var i=0;i<coin_data.length;i++){
                            var the = coin_data[i];
                            if(the["type"] == "0" && the["state"] == "1")
                                li += '<li data-code="coinList" class="touch-event">'+the["currencyCode"]+'</li>';
                        }
                        walletAllList.innerHTML = li+'<li class="touch-event">取消</li>';
                    }
                    if(data["err"] == "1"){
                        //失败
                        confirm("订单查询失败(原因："+data["msg"]+")");
                    }

                    loading("off");
                },
                fail : function(){
                    loading("off");
                    confirm("网络超时，初始化查询失败");
                }
            });
        }catch (err){}

        //扫一扫
        $$.obj("#scan").onclick = function(){
            //扫一扫,与原生交互
            try {
                loading("on","请稍等");
                $$.bridge.callHandler('native_handle', "scan_#10c17d_white",function(){
                    loading("off");
                });
            } catch (err) {
                alert(err);
            }
        };

        if(!isLogin) return;

        //底部菜单
        var menu = $$.obj("#menu");
        var menu_li = menu.getElementsByTagName("li");
        var view = $$.obj("#view");
        var view_li = view.getElementsByClassName("ban");

        //tab菜单
        view.onclick = function(event){
            var get_the = $$.findObj(event);
            if (!get_the || !get_the.className) return false;

            try {
                if(get_the.className && get_the.className.indexOf("order-info")>=0){
                    var pageDetail = $$.obj("#pageDetail");
                    var buy_trade_state = {
                        "1":"对方付款中",//已下单
                        "2":"已付款，请放币",//已付款
                        "3":"已确认",//已确认
                        "4":"申诉完成",//申诉完成
                        "5":"申诉中",//申诉中
                        "6":"已评价",//已评价
                        "7":"待评价"//待评价
                    };
                    var sell_trade_state = {
                        "1":"未付款给对方",//已下单
                        "2":"已付款，请对方放币",//已付款
                        "3":"已确认",//已确认
                        "4":"申诉完成",//申诉完成
                        "5":"申诉中",//申诉中
                        "6":"已评价",//已评价
                        "7":"待评价"//待评价
                    };
                    var order_state = {
                        "1":"订单进行中",//交易中
                        "2":"订单已完成",//已完成
                        "3":"订单已取消",//已取消
                        "4":"订单已过期",//已到期
                        "5":"订单已被关闭"//已关闭
                    };
                    var ui_order_state = {
                        "1":"ing",//交易中
                        "2":"ok",//已完成
                        "3":"cancel",//已取消
                        "4":"expire",//已到期
                        "5":"close"//已关闭
                    };
                    var source_data = {
                        "support" : "Exnet.io交易平台",
                        "wuleiedu" : "ODIN浏览器生态链"
                    };
                    var data_code = get_the.parentNode.getAttribute("data-code");
                    data_code = decodeURIComponent(data_code);
                    //confirm(data_code);
                    data_code = JSON.parse(data_code);
                    console.log(data_code);
                    $$.addClass(pageDetail,"page-in");

                    //图标
                    $$.obj("#orderTop").innerHTML = '<div class="order-top-ban"><span class="order-state-'+ui_order_state[data_code["state"]]+'"></span></div>'+
                        '<div class="order-top-ban"><span class="order-state-'+ui_order_state[data_code["state"]]+'-text">'+[data_code["state"] == "1" ? [[data_code["transactionType"]=="0"?sell_trade_state[data_code["tradingState"]]:buy_trade_state[data_code["tradingState"]]]] : order_state[data_code["state"]]]+'</span></div>';


                    var pageBtn = $$.obj("#pageBtn");
                    if(data_code["state"] == "1"){
                        if(data_code["transactionType"] == "1") {
                            pageBtn.innerHTML = '立即放币';
                        }else {
                            pageBtn.innerHTML = '我已付款';
                        }
                    }else{
                        pageBtn.innerHTML = '查看资产';
                    }

                    try {

                        //对手方
                        $$.obj("#sellerUser").innerHTML = '';
                        if(data_code["buyerNickName"]=="support"){
                            var pay_data = data_code["remark"];
                            //confirm(pay_data);
                            pay_data = decodeURIComponent(pay_data);
                            pay_data = JSON.parse(decodeURIComponent(pay_data));
                            if(pay_data) {
                                $$.obj("#sellerUser").innerHTML = '<em class="photo">' + [pay_data["img"] ? '<img src="' + pay_data["img"] + '">' : [pay_data["nickName"].substr(0, 1).toLocaleUpperCase()]] + '</em>' +
                                    '<em>' + pay_data["nickName"] + '</em>';
                            }
                        }else{
                            $$.obj("#sellerUser").innerHTML = '<em class="photo">'+[[data_code["buyerNickName"].substr(0,1).toLocaleUpperCase()]]+'</em> <em>'+data_code["buyerNickName"]+'</em>';
                        }
                        //收款方式
                        var cardInfo = data_code["accountInfo"];
                        cardInfo = JSON.parse(decodeURIComponent(cardInfo));
                        var payType = data_code["paymentname"]?data_code["paymentname"].replace(/\s/g,"").toLocaleLowerCase():'';
                        var setPayStr = '';
                        var payName = {
                            "onlinebank":"网银转账",
                            "wechat":"微信支付",
                            "alipay":"支付宝"
                        };
                        $$.obj("#orderPayType").innerHTML = '';
                        switch(payType) {
                            case "onlinebank": //银行卡
                                setPayStr = cardInfo["card"]+"("+cardInfo["card"]+")";
                                break;
                            case "wechat": //微信
                            case "alipay": //支付宝
                                setPayStr = [cardInfo["img"]?'<img style="vertical-align: middle;" height="34" src="https://api.coinpay.do/'+cardInfo["img"]+'">':'']+payName[payType]+"("+cardInfo["card"]+")";
                                break;
                        }
                        $$.obj("#orderPayType").innerHTML = setPayStr;
                    }catch (err1){console.log(err1)}

                    try {
                        $$.obj("#sellerUserFrom").innerHTML = '';
                        $$.obj("#sellerUserFrom").innerHTML = '<em>'+[source_data[data_code["buyerNickName"]]?source_data[data_code["buyerNickName"]]+" 用户":"CoinPay.do 用户"]+'</em>';
                    }catch (err1){}

                    //订单金额
                    $$.obj("#orderMoney").innerHTML = '';
                    $$.obj("#orderMoney").innerHTML = data_code["totalMoney"]+" "+data_code["offerFiatCurrencyCode"];
                    //单价
                    $$.obj("#price").innerHTML = '';
                    $$.obj("#price").innerHTML = (parseFloat(data_code["totalMoney"])/parseFloat(data_code["number"])).toFixed(2)+' '+data_code["offerFiatCurrencyCode"]+'/'+data_code["offerCurrencyCode"];
                    //数量
                    $$.obj("#number").innerHTML = '';
                    $$.obj("#number").innerHTML = data_code["number"]+" "+data_code["offerCurrencyCode"];
                    //订单号
                    $$.obj("#orderID").innerHTML = '';
                    $$.obj("#orderID").innerHTML = data_code["orderNum"];
                    $$.obj("#orderID").setAttribute("data-order-id",'');
                    $$.obj("#orderID").setAttribute("data-order-id", data_code["orderNum"]);
                    //下单时间
                    $$.obj("#orderTime").innerHTML = '';
                    $$.obj("#orderTime").innerHTML = $$.format_time(data_code["createTime"]);
                    //
                    $$.obj("#pageBtn").setAttribute("data-code",encodeURIComponent(JSON.stringify(data_code)));
                    //一键申诉
                    if(
                        data_code["payDate"] &&
                        data_code["transactionType"] == "1" &&  //订单进行中
                        data_code["tradingState"] == "2" &&     //订单处于已付款中
                        (new Date().getTime())-parseInt(data_code["payDate"])>(2*60*60*1000)  //超过2小时的订单
                    ){
                        $$.obj("#pageBtn0").parentNode.style.display = 'block';
                    }else{
                        $$.obj("#pageBtn0").parentNode.style.display = 'none';
                    }
                }
            }catch (err){
                //confirm(err);
            }


            try {
                //放币-我已付款
                if(get_the.innerText && (get_the.innerText=="立即放币" || get_the.innerText=="我已付款")){
                    //var orderID = get_the.parentNode.parentNode.parentNode.getAttribute("order-id");
                    var data_code2 = get_the.parentNode.parentNode.parentNode.getAttribute("data-code");
                    data_code2 = decodeURIComponent(data_code2);
                    //confirm(data_code2);
                    data_code2 = JSON.parse(data_code2);
                    var orderID = data_code2["orderNum"];
                    var createTime = parseInt(data_code2["createTime"]);//new Date().getTime();
                    var paymentID = data_code2["opmId"];

                    if(get_the.className && get_the.className.indexOf("disabled")>0) return;

                    confirm("此操作不可逆，确定？",{
                        reset : "取消",
                        sure :  "确定",
                        callback : function(n){
                            if(n===0) return $$.del($$.obj(".confirm")[0]);

                            if(get_the.innerText=="立即放币") {
                                //网络请求
                                coin_release(createTime, orderID);
                            }else if(get_the.innerText=="我已付款") {
                                //网络请求
                                money_release(orderID,paymentID);
                            }
                        }
                    });
                }
            }catch (err){alert(err);}


            try {
                //放币-我已付款
                if(get_the.innerText && (get_the.innerText=="重新上架" || get_the.innerText=="立即下架")) {
                    var get_ID = get_the.getAttribute("data-id");
                    //0下架1上架2失效3已到期
                    switch (get_the.innerText){
                        case "重新上架":
                            ad_state_handle(get_ID,1,get_the);
                            break;
                        case "立即下架":
                            ad_state_handle(get_ID,0,get_the);
                            break;
                    }
                }
            }catch (err){alert(err)}
            
            try{
                //复制
                if(get_the.className && get_the.className.indexOf("is-copy")>=0) {
                    copy(get_the.innerHTML);
                }
            }catch (err){alert(err)}

            try{
                //保存图片到相册
                if(get_the.className && get_the.className.indexOf("save-qr-code")>=0){
                    if(!get_the.getAttribute("data-code")) return alert("图片地址为空");
                    pic_download(get_the.getAttribute("data-code"));
                }
            }catch (err){alert(err)}

            try {
                //有新的订单，点击刷新
                if(get_the.innerText && get_the.innerText=="有新的订单，点击查看") {
                    $$.obj("#menu").getElementsByTagName("li")[0].onclick();
                    setTimeout(function(){
                        get_the.style.display = "none";
                    },200);
                }
            }catch (err){alert(err)}

            try {
                //取消
                if(get_the.innerText && get_the.innerText=="取消") {
                    $$.removeClass($$.obj("#boxOutSelect"),"show");
                }
            }catch (err){alert(err)}

            try {
                //点击列表切换币种
                if(get_the.getAttribute("data-code") && get_the.getAttribute("data-code")=="coinList") {
                    var code = get_the.innerText;
                    localStorage.setItem("current_coin_type",code.toLocaleUpperCase());
                    $$.removeClass($$.obj("#boxOutSelect"),"show");
                    my_wallet();
                }
            }catch (err){alert(err)}
        };

        var pageDetail = $$.obj("#pageDetail");
        pageDetail.onclick = function(event){
            var the = $$.findObj(event);
            if (!the || !the.className) return false;
            if(the.parentNode && the.className.indexOf("prev ")>=0) {
                //alert("perv");
                $$.removeClass(pageDetail, "page-in");
            }
        };

        var pageBtn = $$.obj("#pageBtn");
        pageBtn.onclick = function() {

            try {
                //放币-我已付款
                var data_code2 = this.getAttribute("data-code");
                data_code2 = decodeURIComponent(data_code2);
                //confirm(data_code2);
                data_code2 = JSON.parse(data_code2);
                var orderID = data_code2["orderNum"];
                var createTime = parseInt(data_code2["createTime"]);//new Date().getTime();
                var paymentID = data_code2["opmId"];

                if(this.className && this.className.indexOf("disabled")>0) return;

                if(this.innerText=="查看资产") {
                    $$.removeClass(pageDetail, "page-in");
                    document.querySelectorAll("#menu li")[2].onclick();
                }else {
                    confirm("此操作不可逆，确定？", {
                        reset: "取消",
                        sure: "确定",
                        callback: function (n) {
                            if (n === 0) return $$.del($$.obj(".confirm")[0]);

                            if (this.innerText == "立即放币") {
                                //网络请求
                                coin_release(createTime, orderID);
                            } else if (this.innerText == "我已付款") {
                                //网络请求
                                money_release(orderID, paymentID);
                            }
                        }
                    });
                }
            }catch (err){alert(err);}
            //switch (pageBtn.innerHTML) {
            //    case '立即放币':
            //        break;
            //    case '我已付款':
            //        break;
            //    case '查看资产':
            //        alert("查看资产");
            //        $$.removeClass(pageDetail, "page-in");
            //        break;
            //}
        };

        //一键申诉
        var pageBtn0 = $$.obj("#pageBtn0");
        pageBtn0.onclick = function(){
            var data_code2 = $$.obj("#pageBtn").getAttribute("data-code");
            data_code2 = decodeURIComponent(data_code2);
            console.log(data_code2);
            data_code2 = JSON.parse(data_code2);
            var orderID = data_code2["orderNum"];
            var is_buy = data_code2["transactionType"] == '0'?1:2;
            go_appeal(orderID,is_buy,{
                money:data_code2["totalMoney"],
                userName:data_code2["accountInfo"]
            });
        }

        var copyBtn1 = $$.obj("#copyBtn1");
        copyBtn1.onclick = function(){
            var address = this.getAttribute("data-address");
            if(!address) return alert("地址为空");
            //与原生交互
            try{
                $$.bridge.callHandler('native_handle', "save_qr_code_"+address,function(data){
                    if(data["msg"] === "save success") alert("已经保存到本地相册");
                });
            }catch (err){}
        };

        var copyBtn2 = $$.obj("#copyBtn2");
        copyBtn2.onclick = function(){
            copy(this.getAttribute("data-address"));
        };

        var orderID = $$.obj("#orderID");
        orderID.onclick = function(){
            copy(this.getAttribute("data-order-id"));
        };

        //切换币种
        var walletTab = $$.obj("#walletTab");
        if(walletTab) walletTab.onclick = function(){
            var boxOutSelect = $$.obj("#boxOutSelect");
            if(!boxOutSelect.className) return;
            if(boxOutSelect.className.indexOf(" show")<0){
                $$.addClass(boxOutSelect,"show");
            }else {
                $$.removeClass(boxOutSelect,"show");
            }
        }

        //底部菜单
        for(var i=0;i<menu_li.length;i++){
            var the = menu_li[i];
            var that = view_li[i];

            the.setAttribute("data-id",i);

            $$.removeClass(the,"active");
            $$.removeClass(that,"active");

            the.onclick = function(){
                var _this = this;
                var index = _this.getAttribute("data-id");
                var menu_active = menu.getElementsByClassName("active");
                var ban_active = view.getElementsByClassName("active");

                if(menu_active[0]) $$.removeClass(menu_active[0],"active");
                if(ban_active[0]) $$.removeClass(ban_active[0],"active");

                $$.addClass(_this,"active");
                $$.addClass(view_li[index],"active");

                switch (index.toString()){
                    case "0":
                    case "1":
                        //默认选择tab项
                        try {
                            console.log("index="+index);
                            if(view_li[index]) {
                                var tab_li = view_li[index].querySelectorAll(".tab li");
                                var tab_last_n = localStorage.getItem("last_click_tab_"+index.toString()+"_n");
                                console.log("tab_last_n="+tab_last_n);
                                var default_tab_n = 0;
                                if(tab_last_n || tab_last_n=="0"){
                                    default_tab_n = parseInt(tab_last_n);
                                }
                                console.log("default_tab_n="+default_tab_n);
                                console.log("tab_li[default_tab_n].outerHTML="+tab_li[default_tab_n].outerHTML);
                                if (!tab_li[default_tab_n]){
                                    console.log("tab_li["+default_tab_n+"]不存在"+tab_li[default_tab_n]);
                                    return;
                                }
                                if (tab_li[default_tab_n]) tab_li[default_tab_n].onclick();
                            }
                        }catch (err){
                            confirm(err);
                        }
                        break;
                    case "2":
                        my_wallet();
                        break;
                }

                localStorage.setItem("last_click_n",index);
            };
        }

        //子菜单
        var tabs = document.getElementsByClassName("tab");
        for(var m=0;m<tabs.length;m++){
            var lis = tabs[m].getElementsByTagName("li");
            for(var n=0;n<lis.length;n++){
                lis[n].onclick = function(){
                    var get_the = this;
                    var showList = get_the.parentNode.parentNode.parentNode.getElementsByClassName("show-list");
                    var index = get_the.getAttribute("data-id");
                    var tabActive = get_the.parentNode.getElementsByClassName("tab-active");
                    var showActive = document.getElementsByClassName("show-active");

                    if (tabActive[0]) $$.removeClass(tabActive[0], "tab-active");
                    if (showActive[0]) $$.removeClass(showActive[0], "show-active");

                    if (get_the) $$.addClass(get_the, "tab-active");
                    if (showList[index]) $$.addClass(showList[index], "show-active");

                    //请求数据
                    console.log("get_the.innerHTML="+get_the.innerHTML);
                    var parent_n = 0;
                    switch (get_the.innerHTML) {
                        case "进行中":
                            order_check(1, 0);
                            parent_n = 0;
                            break;
                        case "已完成":
                            order_check(2, 1);
                            parent_n = 0;
                            break;
                        case "已上架":
                            ad_list(1,0);
                            parent_n = 1;
                            break;
                        case "已下架":
                            ad_list(0,1);
                            parent_n = 1;
                            break;
                        default:
                    }

                    localStorage.setItem("last_click_tab_"+parent_n.toString()+"_n",index);
                }
            }
        }

        //默认选择
        var last_n = localStorage.getItem("last_click_n");
        var default_n = 0;
        try {
            if (last_n || last_n=="0") {
                default_n = parseInt(last_n);
            }
            menu_li[default_n].onclick();
        }catch (err){}
    }

    //开始查询订单
    function order_check(state,n){
        var timer = new Date().getTime();
        var orderShow = $$.obj("#orderShow");
        //var showList = orderShow.getElementsByClassName("show-list");
        loading();
        //if(showList[n]) showList[n].innerHTML = '';
        $$.ajax({
            url : "https://api.coinpay.do/pizza/api/order/getOrder",
            type : "POST",
            data : {
                key:window.key,
                state:state,
                timestamp:timer
            },
            success : function(data){
                //confirm(data);
                data = JSON.parse(data);
                if(data["err"] == "0"){
                    order_result_handle(data,n);
                }
                if(data["err"] == "1"){
                    //失败
                    confirm("订单查询失败(原因："+data["msg"]+")");
                }
                loading("off");

                //开始跑定时任务
                if(!window.isAutoTiming && state == "1") {
                    autoTimeRun();
                }
            },
            fail : function(){
                loading("off");
                confirm("网络超时，订单查询失败");
            }
        });
    }

    //订单查询结果展示处理
    function order_result_handle(data,n){
        if(data["data"]){
            if(data["data"]["orderList"]){
                var orderShow = $$.obj("#orderShow");
                var showList = orderShow.getElementsByClassName("show-list");
                var showNoData = orderShow.getElementsByClassName("no-data");
                var _data = data["data"]["orderList"];
                var len = _data.length;
                var buy_trade_state = {
                    "1":"对方付款中",//已下单
                    "2":"已付款，请放币",//已付款
                    "3":"已确认",//已确认
                    "4":"申诉完成",//申诉完成
                    "5":"申诉中",//申诉中
                    "6":"已评价",//已评价
                    "7":"待评价"//待评价
                };
                var sell_trade_state = {
                    "1":"未付款给对方",//已下单
                    "2":"已付款，请对方放币",//已付款
                    "3":"已确认",//已确认
                    "4":"申诉完成",//申诉完成
                    "5":"申诉中",//申诉中
                    "6":"已评价",//已评价
                    "7":"待评价"//待评价
                };
                var order_state = {
                    "1":"订单进行中",//交易中
                    "2":"订单已完成",//已完成
                    "3":"订单已取消",//已取消
                    "4":"订单已过期",//已到期
                    "5":"订单已被关闭"//已关闭
                };
                var source_data = {
                    "support" : "Exnet.io交易平台用户",
                    "wuleiedu" : "ODIN浏览器生态链用户"
                };
                var ulObj = showList[n].getElementsByTagName("ul");

                if(showList[n]) {
                    if (ulObj.length < 1) {
                        console.log("不存在任何数据 ulObj.length=" + ulObj.length);
                        showList[n].innerHTML = '<ul class="order-ul"></ul>';
                        ulObj = showList[n].getElementsByTagName("ul")[0];
                    } else {
                        console.log("已经存在一些数据 数据长度=" + ulObj[0].getElementsByTagName("li").length);
                        ulObj = ulObj[0];
                    }
                }

                if(len===0) {
                    try {
                        if (showNoData[0] && showNoData[0].getElementsByClassName("no-data-text")[0]) {
                            $$.addClass(showNoData[0], "tab-active");
                            showNoData[0].getElementsByClassName("no-data-text")[0].innerHTML = '没有' + [n == "0" ? "进行中" : "已完成"] + '的订单';
                            ulObj.innerHTML = '';
                        }
                    }catch (err){}
                }else{
                    try {
                        if(showNoData[0]){
                            $$.removeClass(showNoData[0],"tab-active");
                            showNoData[0].getElementsByClassName("no-data-text")[0].innerHTML = '';
                        }
                    }catch (err){}

                    try {
                        //console.log("排序前：");
                        //for(var n=0;n<_data.length;n++){
                        //    console.log($$.format_time(_data[n]["createTime"]));
                        //}
                        $$.order_by(_data,"createTime",true);
                        //console.log("排序后：");
                        //for(var n=0;n<_data.length;n++){
                        //    console.log($$.format_time(_data[n]["createTime"]));
                        //}

                        for (var i = 0; i < len; i++) {
                            var remark = _data[i]["remark"];
                            var tel='',username='',simpleUserName="O";
                            try {
                                remark = JSON.parse(remark);
                                tel = remark["mobile"];
                                username = remark["nickName"];
                                simpleUserName = username.substr(0,1).toUpperCase();
                                if(!username) username = "匿名用户";
                            }catch (err){
                                username = "匿名用户";
                            }

                            var pay_html = '';
                            try {
                                var accountInfo =  JSON.parse(_data[i]["accountInfo"]);
                                var payType = _data[i]["paymentname"].replace(/\s/g,"").toLocaleLowerCase();
                                var payName = {
                                    "onlinebank":"网银转账",
                                    "wechat":"微信支付",
                                    "alipay":"支付宝"
                                };
                                switch(payType) {
                                    case "onlinebank": //银行卡
                                        pay_html = '<p class="order-pay">' +
                                        '<span>' +
                                        '<em>收款方</em>' +
                                        '<em class="is-copy touch-event">' + accountInfo["name"] + '</em>' +
                                        '</span>' +
                                        '<span>' +
                                        '<span>' +
                                        '<em>收款方式</em>' +
                                        '<em>' + payName[payType] + '</em>' +
                                        '</span>' +
                                        '<em>开户银行</em>' +
                                        '<em class="is-copy touch-event">' + accountInfo["bank"] + '</em>' +
                                        '</span>' +
                                        '<span>' +
                                        '<em>银行卡号</em>' +
                                        '<em class="is-copy touch-event">' + accountInfo["card"] + '</em>' +
                                        '</span>' +
                                        '</p>';
                                        break;
                                    case "wechat": //微信
                                    case "alipay": //支付宝
                                        pay_html = '<p class="order-pay">' +
                                            '<span class="qrcode">' +
                                            '<em><img src="https://api.coinpay.do/' + accountInfo["img"] + '"></em>' +
                                            '<em class="save-qr-code touch-event"  data-code="https://api.coinpay.do/' + accountInfo["img"] + '">保存图片到相册</em>' +
                                            '</span>' +
                                            '<span>' +
                                            '<em>收款方</em>' +
                                            '<em class="is-copy touch-event">' + accountInfo["name"] + '</em>' +
                                            '</span>' +
                                            '<span>' +
                                            '<em>收款方式</em>' +
                                            '<em>' + payName[payType] + '</em>' +
                                            '</span>' +
                                            '<span>' +
                                            '<em>收款账号</em>' +
                                            '<em class="is-copy touch-event">' + accountInfo["card"] + '</em>' +
                                            '</span>' +
                                            '</p>';
                                        break;
                                }
                            }catch (err){
                                pay_html = '';
                            }

                            //字段拼接
                            var html =
                                '<p class="order-header">' +
                                '<span class="user-info">' +
                                '<em class="user-photo">'+simpleUserName+'</em>' +
                                '<em class="user-nick-name">' + [_data[i]["buyerNickName"]=="support"?username:_data[i]["buyerNickName"]] + '</em>' +
                                '<em class="user-from">'+[source_data[_data[i]["buyerNickName"]]?"来自"+source_data[_data[i]["buyerNickName"]]:"来自CoinPay.do用户"]+'</em>' +
                                '</span>' +
                                '<span class="order-time">' + $$.format_time(_data[i]["createTime"]) +
                                [_data[i]["transactionType"] == "1" && _data[i]["tradingState"] == "2" && _data[i]["payDate"] && (new Date().getTime())-parseInt(_data[i]["payDate"])>(2*60*60*1000)?'<span class="font-blue">(可申诉)</span>':""] +
                                '</span>' +
                                '</p>' +
                                '<p class="touch-event order-info">' +
                                '<span class="order-item">' +
                                '<em>对方'+[_data[i]["state"] == "1" ?"正在":"已"]+'向你</em>' +
                                '<em>' + [_data[i]["transactionType"] == "0" ? "售出" : "购买"] + '</em>' +
                                '<em>' + _data[i]["number"] + ' </em>' +
                                '<em>' + _data[i]["offerCurrencyCode"] + '</em>' +
                                '</span>' +
                                '<span class="order-number">' +
                                '<em>' + parseInt(_data[i]["totalMoney"]) + '</em>' +
                                '<em>.' + ((parseFloat(_data[i]["totalMoney"]).toFixed(2).toString()).split(".")[1]) + '</em>' +
                                '<em>' + _data[i]["offerFiatCurrencyCode"] + '</em>' +
                                '</span>' +
                                '<span class="order-state">' + [_data[i]["state"] == "1" ? [[_data[i]["transactionType"]=="0"?sell_trade_state[_data[i]["tradingState"]]:buy_trade_state[_data[i]["tradingState"]]]] : order_state[_data[i]["state"]]] + '</span>' +
                                '</p>' +
                                pay_html +
                                '<p' + [_data[i]["state"] !== '1' ? ' style="opacity: 0;height:0;padding-bottom:0;"' : ''] + ' class="order-handle">' +
                                '<span class="left">' +
                                '<a href="'+[tel?"tel:"+tel:"javascript:;"]+'" class="tel btn touch-event '+[tel?"":"disabled"]+'">'+[tel?"电话催促":"未留电话"]+'</a>' +
                                '</span>' +
                                '<span class="right">' +
                                '<a href="javascript:;" class="btn touch-event'+[[_data[i]["transactionType"]=="1"?[_data[i]["tradingState"]=="2"?"":" disabled"]:[""]]]+'">' + [_data[i]["transactionType"] == "0" ? "我已付款" : "立即放币"] + '</a>' +
                                '</span>' +
                                '</p>';

                            //判断该记录是否存在
                            //console.log("判断该记录是否存在");
                            var get_current_obj = $$.obj("#orderList"+_data[i]["orderNum"]);
                            if(get_current_obj){
                                //存在该记录，只需更新信息
                                console.log("存在该记录，只需更新信息");
                                get_current_obj.innerHTML = html;
                            }else{
                                //不存在该记录，需要插入
                                console.log("不存在该记录，需要插入");
                                var new_li = document.createElement("li");
                                new_li.setAttribute("data-code",encodeURIComponent(JSON.stringify(_data[i])));
                                new_li.id = "orderList"+_data[i]["orderNum"];
                                new_li.innerHTML = html;
                                new_li.className = _data[i]["transactionType"] == "0" ? "sell" : "buy";
                                //插在最前面
                                ulObj.insertBefore(new_li,ulObj.getElementsByTagName("li")[0]);

                            }
                        }

                    }catch (err){
                        confirm(err);
                    }
                }
            }
        }
    }

    //放币
    function coin_release(createTime,orderID){
        var get_token = HMAC_SHA256_MAC(window.secret, "key="+window.key+"&orderNum="+orderID);
        var timer = new Date().getTime();
        loading("请稍后");
        //开始放币
        $$.ajax({
            //url : "http://10.45.0.91:8080/pizza/api/order/release",
            url : "https://api.coinpay.do/pizza/api/order/release",
            type: "POST",
            data: {
                key:window.key,
                orderNum: orderID, //订单号
                content: get_token, //sha256使用secret签名后的数据
                timestamp: timer //调用Open API时的当前系统时间戳(允许传入时间戳与系统时间相差30s内)
            },
            success: function (result) {
                loading("off");
                //console.log(result);
                result = JSON.parse(result);
                if (result["err"] == "0") {
                    //成功
                    var get_timer = (new Date().getTime() - createTime)/1000;
                    get_timer = parseInt(get_timer);
                    var temp_timer = '';
                    var hours = Math.floor(get_timer/(60*60));
                    var minutes = Math.floor(get_timer/60)-Math.floor(get_timer/3600)*60;
                    var second = Math.floor(get_timer)-Math.floor(get_timer/60)*60;
                    if(hours>0) temp_timer += hours + "小时";
                    if(minutes>0) temp_timer += minutes + "分";
                    if(second>0) temp_timer += second + "秒";
                    confirm("订单("+orderID+")放币成功!</br>本订单耗时 "+ temp_timer,null,function(){
                        //$$.obj(".icon-order")[0].parentNode.onclick();
                        document.location.reload();
                    });
                }else if(result["err"] == "1") {
                    //失败
                    //confirm("放币失败(原因：" + result["msg"] + ")");
                    confirm("订单("+orderID+")放币失败(原因：" + result["msg"] + ")");
                }else console.log(result);
            },
            fail : function(){
                loading("off");
                confirm("网络超时，放币失败");
            }
        });
    }
    //我已付款
    function money_release(orderID,opmId){
        var get_token = HMAC_SHA256_MAC(window.secret, "key="+window.key+"&opmId="+opmId+"&orderNum="+orderID);
        var timer = new Date().getTime();
        loading("请稍后");
        //开始放币
        $$.ajax({
            url : "https://api.coinpay.do/pizza/api/order/orderPayment",
            type: "POST",
            data: {
                key:window.key,
                orderNum: orderID, //订单号
                opmId : opmId,
                content: get_token, //sha256使用secret签名后的数据
                timestamp: timer //调用Open API时的当前系统时间戳(允许传入时间戳与系统时间相差30s内)
            },
            success: function (result) {
                loading("off");
                //console.log(result);
                result = JSON.parse(result);
                if (result["err"] == "0") {
                    //成功
                    confirm("提交成功，等待对方放币！",function(){
                        $$.obj("#orderIng").onclick();
                    });
                }else if(result["err"] == "1") {
                    //失败
                    confirm("提交("+orderID+")失败(原因：" + result["msg"] + ")");
                }else console.log(result);
            },
            fail : function(){
                loading("off");
                confirm("网络超时，提交失败");
            }
        });
    }
    //一键申诉
    function go_appeal(orderID,typeInit,orderInfo){
        var request_data = {
            key:window.key,
            orderNum: orderID, //订单号
            type:typeInit,//1买 2卖
            cause:1,//1买家未进行转账操作,未收到转账 2其他
            complaintTxt:encodeURIComponent("[来自承兑商App]"),
            timestamp: new Date().getTime() //调用Open API时的当前系统时间戳(允许传入时间戳与系统时间相差30s内)
        };
        console.log("cause="+request_data.cause+"&complaintTxt="+request_data.complaintTxt+"&key="+window.key+"&orderNum="+request_data.orderNum+"&type="+request_data.type);
        var get_token = HMAC_SHA256_MAC(window.secret, "cause="+request_data.cause+"&complaintTxt="+request_data.complaintTxt+"&key="+window.key+"&orderNum="+request_data.orderNum+"&type="+request_data.type);
        confirm('<p class="box-out-p">申诉金额：'+orderInfo.money+' 元</p>'+
                '<p class="box-out-p">申诉对象：<span>'+orderInfo.userName+'</span></p>'+
                '<p class="box-out-p">申诉原因：买家未进行转账操作,未收到转账</p>'+
                '<p class="box-out-p">客服建议：电话联系对方或者耐心等待到账</p>'
            ,{
                title:"申诉确认",
                reset:"取消",
                sure:"提交",
                callback:function(n){
                    if(n==1) {
                        loading("请稍后");
                        request_data["content"] = get_token;
                        //开始一键申诉
                        $$.ajax({
                            url: "https://api.coinpay.do/pizza/api/order/otcTradeComplaint",
                            type: "POST",
                            data: request_data,
                            success: function (result) {
                                loading("off");
                                //console.log(result);
                                result = JSON.parse(result);
                                if (result["err"] == "0") {
                                    //成功
                                    confirm("提交成功，等待客服调查！", function () {
                                        document.querySelector("#pageDetail header .prev").onclick();
                                    });
                                } else if (result["err"] == "1") {
                                    //失败
                                    confirm("提交(" + orderID + ")失败(原因：" + result["msg"] + ")");
                                } else console.log(result);
                            },
                            fail: function () {
                                loading("off");
                                confirm("网络超时，提交失败");
                            }
                        });
                    }
            }
        });
    }


    //广告列表获取
    function ad_list(state,n){
        var timer = new Date().getTime();
        var orderShow = $$.obj("#orderShow");
        var showList = orderShow.getElementsByClassName("show-list");
        loading();
        //if(showList[n]) showList[n].innerHTML = '';
        var get_token = HMAC_SHA256_MAC(window.secret,"key="+window.key);
        $$.ajax({
            url : "https://api.coinpay.do/pizza/api/transaction/getTransactionList",
            type : "POST",
            data : {
                key:window.key,
                content:get_token,
                timestamp:timer
            },
            success : function(data){
                //confirm(data);
                data = JSON.parse(data);
                if(data["err"] == "0"){
                    var _data = {};
                    data = data["data"];
                    _data["payType"] = data["payType"];
                    _data["transaction"] = [];
                    for(var i=0;i<data["transaction"].length;i++){
                        //console.log("transaction"+data["transaction"][i]["state"]);
                        if(state == data["transaction"][i]["state"]){
                            //console.log("state="+state);
                            _data["transaction"].push(data["transaction"][i]);
                        }
                    }
                    //console.log(_data);
                    ad_list_handle(_data,n);
                }
                if(data["err"] == "1"){
                    //失败
                    confirm("广告列表获取失败(原因："+data["msg"]+")");
                }
                loading("off");
            },
            fail : function(){
                loading("off");
                confirm("网络超时，广告列表获取失败");
            }
        });
    }

    function ad_list_handle(data,n){

        var payType = data["payType"];
        var transaction = data["transaction"];
        var html = '<ul class="ad-ul">';
        var adShow = $$.obj("#adShow");
        var adShowList = adShow.getElementsByClassName("show-list");
        var noData = adShow.getElementsByClassName("no-data");
        var payData = {};
        var adState = {
            "0":"已下架",
            "1":"已上架",
            "2":"已失效",
            "3":"已到期"
        };

        if(transaction && payType && adShowList[n]){

            for(var j=0;j<payType.length;j++){
                payData[payType[j]["id"]] = '<img src="https://api.coinpay.do/'+payType[j]["relPath"]+'">';
            }

            console.log("transaction.length="+transaction.length);
            if(transaction.length<1){
                try {
                    if (noData[0] && noData[0].getElementsByClassName("no-data-text")[0]) {
                        noData[0].style.display = "block";
                        noData[0].getElementsByClassName("no-data-text")[0].innerHTML = '没有已' + [n == "0" ? "上" : "下"] + '架的广告';
                        adShowList[n].innerHTML = '';
                    }
                }catch (err){confirm(err)}
            }else {

                if(noData[0]) noData[0].style.display = "none";

                for (var i = 0; i < transaction.length; i++) {

                    var payStr = '';
                    var getPayStr = transaction[i]["opmId"];
                    if(getPayStr.length>0){
                        getPayStr = getPayStr.split(",");
                        for(var p=0;p<getPayStr.length;p++){
                            try {
                                payStr += payData[getPayStr[p]];
                            }catch (err){}
                        }
                    }

                    html += '<li>' +
                        '<p class="ad-header">' +
                        '<span><em>'+[transaction[i]["transactionType"]=="1"?"<strong class='color-sell'>出售</strong>":"<strong class='color-buy'>收购</strong>"]+transaction[i]["offerCurrencyCode"]+'</em></span>'+
                        '</p>'+
                        '<p class="ad-info">' +
                        '<span><em>ID：</em><em>'+transaction[i]["serialNum"]+'</em></span>' +
                        //'<span><em>类型：</em><em>'+[transaction[i]["transactionType"]=="1"?"<strong class='color-sell'>出售</strong>":"<strong class='color-buy'>收购</strong>"]+'广告</em></span>' +
                        '<span><em>限额：</em><em>'+transaction[i]["minPrice"]+' '+transaction[i]["offerFiatCurrencyCode"]+' 至 '+transaction[i]["maxPrice"]+' '+transaction[i]["offerFiatCurrencyCode"]+'</em></span>' +
                        '<span><em>过期时间：</em><em>'+[transaction[i]["expiryTime"]?$$.format_time(transaction[i]["expiryTime"]):'永不过期']+'</em></span>' +
                        '<span><em>付款方式：</em><em>'+payStr+'</em></span>' +
                        //'<span><em>自定义价格：</em><em>'+[transaction[i]["type"]=="1"?"是":"否"]+'</em></span>' +
                        '<span><em>'+[transaction[i]["transactionType"]=="1"?"出售":"收购"]+'单价：</em><em>'+[transaction[i]["type"]=="1"?transaction[i]["AcceptablePrice"]:"市场价格 x "+transaction[i]["AcceptablePrice"]]+[transaction[i]["type"]=="1"?" (自定义价格)":""]+'</em></span>' +
                            //'<span><em>已成交：</em><em>2 笔</em></span>' +
                        '<span><em>状态：</em><em>'+adState[transaction[i]["state"]]+'</em></span>' +
                        '</p>' +
                        '<p class="ad-handle">' +
                        '<span class="right">' +
                        '<button type="button" data-id="'+transaction[i]["serialNum"]+'" class="btn touch-event">'+[transaction[i]["state"]=="1"?"立即下架":"重新上架"]+'</button>' +
                        '</span>' +
                        '</p>' +
                        '</li>';
                }

                adShowList[n].innerHTML = html + '</ul>';
            }
        }else{
            console.log("222");
        }
    }

    function my_wallet(){
        var code = localStorage.getItem("current_coin_type");
        if(!code) code = "USDT";
        var timer = new Date().getTime();
        var get_token = HMAC_SHA256_MAC(window.secret,"key="+window.key);
        loading();

        var boxOutSelect = $$.obj("#boxOutSelect");
        var walletAllList = $$.obj("#walletAllList");
        $$.ajax({
            url : "https://api.coinpay.do/pizza/gw/coinMarketList/getCoinMarketList?convert=CNY&limit=",
            type : "GET",
            success : function(data){
                data = JSON.parse(data);
                if(data["err"] == "0"){
                    var list_data = data["data"]["list"];
                    window.cny_list = {};
                    for(var i=0;i<list_data.length;i++){
                        var the = list_data[i];
                        window.cny_list[the["symbol"]] = parseFloat(the["price"]);
                    }
                    console.log(window.cny_list);

                    $$.ajax({
                        url : "https://api.coinpay.do/pizza/api/wallets/viewUserWallets",
                        type : "POST",
                        data : {
                            key:window.key,
                            content:get_token,
                            timestamp:timer
                        },
                        success : function(data){
                            //confirm(data);
                            //loading("off");
                            data = JSON.parse(data);
                            if(data["err"] == "0"){

                                var new_data = data["data"];

                                //查询code充值地址
                                var get_token = HMAC_SHA256_MAC(window.secret,"currencyCode="+code+"&key="+window.key);
                                if(code!=="CNHT") {
                                    $$.ajax({
                                        url: "https://api.coinpay.do/pizza/api/wallets/getAddress",
                                        type: "POST",
                                        data: {
                                            key: window.key,
                                            content: get_token,
                                            currencyCode: code
                                        },
                                        success: function (result) {
                                            //confirm(result);
                                            loading("off");
                                            result = JSON.parse(result);
                                            if (result["err"] == "0") {
                                                new_data["address"] = result["data"]["wasAddress"];
                                                console.log(new_data);
                                            }
                                            if (result["err"] == "1") {
                                                //失败
                                                confirm("查询充值地址失败(原因：" + result["msg"] + ")");
                                            }

                                            my_wallet_handle(code, new_data);
                                        },
                                        fail: function () {
                                            loading("off");
                                            confirm("读取钱包地址失败(可能的原因：网络超时)");

                                            my_wallet_handle(code, new_data);
                                        }
                                    });
                                }else{
                                    my_wallet_handle(code,new_data);
                                }

                            }else {
                                if (data["err"] == "1") {
                                    //失败
                                    confirm("读取钱包充值地址失败(原因：" + data["msg"] + ")");
                                }
                                loading("off");
                            }
                        },
                        fail : function(){
                            loading("off");
                            confirm("读取资产数据失败(可能的原因：网络超时)");
                        }
                    });
                }
                if(data["err"] == "1"){
                    //失败
                    confirm("初始化查询失败(原因："+data["msg"]+")");
                }
                loading("off");
            },
            fail : function(){
                loading("off");
                confirm("网络超时，初始化查询失败");
            }
        });
    }

    function my_wallet_handle(code,result){

        var data = result["list"];
        var address = result["address"];

        for(var i=0;i<data.length;i++){

            if(data[i]["currencyCode"].toUpperCase() == code.toUpperCase()){

                var wallet001 = $$.obj("#wallet001");
                var wallet002 = $$.obj("#wallet002");
                var wallet003 = $$.obj("#wallet003");
                var wallet005 = $$.obj("#wallet005");
                var copyBtn1 =  $$.obj("#copyBtn1");
                var walletTitle =  $$.obj("#walletTitle");
                var copyBtn2 =  $$.obj("#copyBtn2");
                var copyShow1 =  $$.obj("#copyShow1");
                var rate = window.cny_list[code]?window.cny_list[code]:1;

                wallet001.innerHTML = '<span>'+parseFloat(data[i]["totalMoney"]).toFixed(2)+'</span> <span>'+code+'</span>';
                wallet002.innerHTML = '<span>估值</span> <span>'+(parseFloat(data[i]["totalMoney"])*parseFloat(rate)).toFixed(2)+'</span> <span>元</span>';
                wallet005.innerHTML = '<span>&nbsp;下单冻结</span> <span>'+((parseFloat(data[i]["totalMoney"])-parseFloat(data[i]["availableBalance"]))*parseFloat(rate)).toFixed(2)+'</span> <span>元&nbsp;</span>';
                wallet003.innerHTML = code;
                walletTitle.innerHTML = code+'钱包';

                if(!address){
                    var wallet004 = $$.obj("#wallet004");
                    wallet004.innerHTML = '<img src="https://imgs.exnet.io/exnetImgs/pub/wechat_kefu.png">';
                    copyBtn1.innerHTML = '客服微信二维码（点击保存到相册）';
                    copyShow1.innerHTML = code+'不支持充币，请联系客服人员';
                    copyBtn2.innerHTML = '';
                    copyBtn1.setAttribute("data-address","https://u.wechat.com/MMB4RLM1c5jKOzUY2HeOgjo");
                }else {
                    //获取二维码,与原生交互
                    try {
                        $$.bridge.callHandler('native_handle', "get_qr_code_base64_" + address, function (result) {
                            //console.log("二维码图片Base64编码="+result["msg"]);
                            var wallet004 = $$.obj("#wallet004");
                            wallet004.innerHTML = '<img src="' + result["msg"] + '">';
                        });
                        copyBtn1.innerHTML = '保存二维码到相册';
                        copyBtn2.innerHTML = '复制充值地址';
                        //充值地址
                        copyBtn1.setAttribute("data-address",address);
                        copyShow1.innerHTML = address;
                        copyBtn2.setAttribute('data-address',address);
                    } catch (err) {
                    }
                }

                break;
            }
        }
    }

    //上\下架广告
    function  ad_state_handle(adID,state,obj){
        var timer = new Date().getTime();
        var get_token = HMAC_SHA256_MAC(window.secret,"key="+window.key+"&serialNum="+adID+"&state="+state);
        loading();
        $$.ajax({
            url : "https://api.coinpay.do/pizza/api/transaction/updateAD",
            type : "POST",
            data : {
                key:window.key,
                serialNum : adID, //广告流水号
                state:state,//状态:0下架1上架2失效3已到期
                content:get_token,
                timestamp:timer
            },
            success : function(data){
                data = JSON.parse(data);
                if(data["err"] == "0"){
                    alert("处理成功");
                    obj.innerHTML = "已"+[state=="1"?"上架":"下架"];
                    obj.disabled = true;
                }
                if(data["err"] == "1"){
                    //失败
                    confirm("广告状态更新失败(原因："+data["msg"]+")");
                }
                loading("off");
            },
            fail : function(){
                loading("off");
                console.log("广告状态更新失败(可能的原因：网络超时)");
            }
        });
    }

    function copy(str){
        //复制,与原生交互
        try {
            $$.bridge.callHandler('native_handle', "copy_"+str,function(data){
                alert("复制成功");
            });
        } catch (err) {}
    }

    function pic_download(url){
        //与原生交互
        try {
            $$.bridge.callHandler('native_handle', "save_img_url_"+url,function(data){
                alert("已经保存到系统相册");
            });
        } catch (err) {}
    }

    //定时任务
    function autoTimeRun(){

        //查询进行中的订单
        var timer = new Date().getTime();
        $$.ajax({
            url : "https://api.coinpay.do/pizza/api/order/getOrder",
            type : "POST",
            data : {
                key:window.key,
                state:1,
                timestamp:timer
            },
            success : function(data){
                //confirm(data);
                data = JSON.parse(data);

                if(data["err"] == "0") {
                    var orderList = data["data"]["orderList"];
                    var len = orderList.length; //取得最新的数据
                    var orderShow = $$.obj("#orderShow");
                    var showList = orderShow.getElementsByClassName("show-list");
                    var last_tab_n = localStorage.getItem("last_click_tab_0_n");
                    var last_click_n = localStorage.getItem("last_click_n");
                    showList = showList[0];
                    var showListLi = showList.getElementsByTagName("li");
                    var old_len = showListLi.length;
                    console.log("old_len="+old_len);
                    console.log("len="+len);
                    if(old_len < len){
                        //有新的订单
                        console.log("有新的订单");
                        if(last_click_n == "0"){
                            if(last_tab_n=="0") {
                                $$.obj("#msgNew").style.display = "block";
                            }else{
                                $$.addClass(document.querySelector("#view .ban .tab li"),"tab-new-msg");
                            }
                        }else{
                            $$.addClass(document.querySelector("#menu li"),"menu-new-msg");
                        }

                        //推送本地通知,与原生交互
                        if(!window.last_push_time || new Date().getTime()-parseInt(window.last_push_time)>180000) {
                            try {
                                $$.bridge.callHandler('native_handle', "local_msg_push:" + encodeURIComponent(JSON.stringify({
                                        "title": "订单通知", //标题（可缺省）
                                        "subtitle": "", //副标题（可缺省）
                                        "content": "您有新订单啦，请及时处理", //内容
                                        "settimeout": 1, //多久后触发此通知(大于0的正整数) 默认5秒（可缺省）
                                        "badge": 0 //角标（显示在桌面icon右上角的红色消息数）
                                    })), function (data) {
                                    console.log(data["msg"]);

                                    window.last_push_time = new Date().getTime();
                                });
                            } catch (err) {
                            }
                        }
                    }else if(old_len == len){
                        //没有新订单
                        $$.obj("#msgNew").style.display = "none";
                        $$.removeClass(document.querySelector("#view .ban .tab li"),"tab-new-msg");
                    }else{
                        //有订单取消
                        location.href = location.href;
                    }

                    if(len>0){
                        //更新当前订单状态
                        var _data = data["data"]["orderList"];
                        var buy_trade_state = {
                            "1":"对方付款中",//已下单
                            "2":"已付款，请放币",//已付款
                            "3":"已确认",//已确认
                            "4":"申诉完成",//申诉完成
                            "5":"申诉中",//申诉中
                            "6":"已评价",//已评价
                            "7":"待评价"//待评价
                        };
                        var sell_trade_state = {
                            "1":"未付款给对方",//已下单
                            "2":"已付款，请对方放币",//已付款
                            "3":"已确认",//已确认
                            "4":"申诉完成",//申诉完成
                            "5":"申诉中",//申诉中
                            "6":"已评价",//已评价
                            "7":"待评价"//待评价
                        };
                        var order_state = {
                            "1":"订单进行中",//交易中
                            "2":"订单已完成",//已完成
                            "3":"订单已取消",//已取消
                            "4":"订单已过期",//已到期
                            "5":"订单已被关闭"//已关闭
                        };
                        var source_data = {
                            "support" : "Exnet.io交易平台用户",
                            "wuleiedu" : "ODIN浏览器生态链用户"
                        };
                        $$.order_by(_data, "createTime", true);
                        for (var i = 0; i < len; i++) {
                            var remark = _data[i]["remark"];
                            var tel='',username='',simpleUserName="O";
                            try {
                                remark = JSON.parse(remark);
                                tel = remark["mobile"];
                                username = remark["nickName"];
                                simpleUserName = username.substr(0,1).toUpperCase();
                                if(!username) username = "匿名用户";
                            }catch (err){
                                username = "匿名用户";
                            }

                            var pay_html = '';
                            try {
                                var accountInfo =  JSON.parse(_data[i]["accountInfo"]);
                                var payType = _data[i]["paymentname"].replace(/\s/g,"").toLocaleLowerCase();
                                var payName = {
                                    "onlinebank":"网银转账",
                                    "wechat":"微信支付",
                                    "alipay":"支付宝"
                                };
                                switch(payType) {
                                    case "onlinebank": //银行卡
                                        pay_html = '<p class="order-pay">' +
                                            '<span>' +
                                            '<em>收款方</em>' +
                                            '<em class="is-copy touch-event">' + accountInfo["name"] + '</em>' +
                                            '</span>' +
                                            '<span>' +
                                            '<span>' +
                                            '<em>收款方式</em>' +
                                            '<em>' + payName[payType] + '</em>' +
                                            '</span>' +
                                            '<em>开户银行</em>' +
                                            '<em class="is-copy touch-event">' + accountInfo["bank"] + '</em>' +
                                            '</span>' +
                                            '<span>' +
                                            '<em>银行卡号</em>' +
                                            '<em class="is-copy touch-event">' + accountInfo["card"] + '</em>' +
                                            '</span>' +
                                            '</p>';
                                        break;
                                    case "wechat": //微信
                                    case "alipay": //支付宝
                                        pay_html = '<p class="order-pay">' +
                                            '<span class="qrcode">' +
                                            '<em><img src="https://api.coinpay.do/' + accountInfo["img"] + '"></em>' +
                                            '<em class="save-qr-code touch-event" data-code="https://api.coinpay.do/' + accountInfo["img"] + '">保存图片到相册</em>' +
                                            '</span>' +
                                            '<span>' +
                                            '<em>收款方</em>' +
                                            '<em class="is-copy touch-event">' + accountInfo["name"] + '</em>' +
                                            '</span>' +
                                            '<span>' +
                                            '<em>收款方式</em>' +
                                            '<em>' + payName[payType] + '</em>' +
                                            '</span>' +
                                            '<span>' +
                                            '<em>收款账号</em>' +
                                            '<em class="is-copy touch-event">' + accountInfo["card"] + '</em>' +
                                            '</span>' +
                                            '</p>';
                                        break;
                                }
                            }catch (err){
                                console.log(err);
                                pay_html = '';
                            }

                            //字段拼接
                            var html =
                                '<p class="order-header">' +
                                '<span class="user-info">' +
                                '<em class="user-photo">'+simpleUserName+'</em>' +
                                '<em class="user-nick-name">' + [_data[i]["buyerNickName"]=="support"?username:_data[i]["buyerNickName"]] + '</em>' +
                                '<em class="user-from">'+[source_data[_data[i]["buyerNickName"]]?"来自"+source_data[_data[i]["buyerNickName"]]:"来自CoinPay.do用户"]+'</em>' +
                                '</span>' +
                                '<span class="order-time">' + $$.format_time(_data[i]["createTime"]) +
                                [_data[i]["transactionType"] == "1" && _data[i]["tradingState"] == "2" && _data[i]["payDate"] && (new Date().getTime())-parseInt(_data[i]["payDate"])>(2*60*60*1000)?'<span class="font-blue">(可申诉)</span>':""] +
                                '</span>' +
                                '</p>' +
                                '<p class="touch-event order-info">' +
                                '<span class="order-item">' +
                                '<em>对方'+[_data[i]["state"] == "1" ?"正在":"已"]+'向你</em>' +
                                '<em>' + [_data[i]["transactionType"] == "0" ? "售出" : "购买"] + '</em>' +
                                '<em>' + _data[i]["number"] + ' </em>' +
                                '<em>' + _data[i]["offerCurrencyCode"] + '</em>' +
                                '</span>' +
                                '<span class="order-number">' +
                                '<em>' + parseInt(_data[i]["totalMoney"]) + '</em>' +
                                '<em>.' + ((parseFloat(_data[i]["totalMoney"]).toFixed(2).toString()).split(".")[1]) + '</em>' +
                                '<em>' + _data[i]["offerFiatCurrencyCode"] + '</em>' +
                                '</span>' +
                                '<span class="order-state">' + [_data[i]["state"] == "1" ? [[_data[i]["transactionType"]=="0"?sell_trade_state[_data[i]["tradingState"]]:buy_trade_state[_data[i]["tradingState"]]]] : order_state[_data[i]["state"]]] + '</span>' +
                                '</p>' +
                                pay_html +
                                '<p' + [_data[i]["state"] !== '1' ? ' style="opacity: 0;height:0;padding-bottom:0;"' : ''] + ' class="order-handle">' +
                                '<span class="left">' +
                                '<a href="'+[tel?"tel:"+tel:"javascript:;"]+'" class="tel btn touch-event '+[tel?"":"disabled"]+'">'+[tel?"电话催促":"未留电话"]+'</a>' +
                                '</span>' +
                                '<span class="right">' +
                                '<a href="javascript:;" class="btn touch-event'+[[_data[i]["transactionType"]=="1"?[_data[i]["tradingState"]=="2"?"":" disabled"]:[""]]]+'">' + [_data[i]["transactionType"] == "0" ? "我已付款" : "立即放币"] + '</a>' +
                                '</span>' +
                                '</p>';

                            //判断该记录是否存在
                            //console.log("判断该记录是否存在");
                            var get_current_obj = $$.obj("#orderList" + _data[i]["orderNum"]);
                            if (get_current_obj) {
                                //存在该记录，只需更新信息
                                console.log("存在该记录，只需更新信息");
                                get_current_obj.innerHTML = html;
                            } else {
                                //不存在该记录，啥都不动
                            }
                        }
                    }
                }

                window.isAutoTiming = setTimeout(function(){
                    autoTimeRun();
                },6000);
            },
            fail : function(){
                console.log("订单查询失败(可能的原因：网络超时)");
            }
        });
    }

})();