(function(){

    window.addEventListener("touchstart",touchstart,false);
    window.addEventListener("touchmove",touchmove,false);
    window.addEventListener("touchend",touchend,false);
    window.addEventListener("touchcancel",touchend,false);

    //设备物理分辨率
    //alert(window.innerWidth*window.devicePixelRatio/2+","+window.innerHeight*window.devicePixelRatio/2);

    function touchstart(){
        var the = $$.findObj(event);
        $$.removeClass(the,"touch-event-active");
        $$.addClass(the,"touch-event-active");
    }
    function touchmove(){
        var the = $$.findObj(event);
        $$.removeClass(the,"touch-event-active");
    }
    function touchend(){
        var the = $$.findObj(event);
        setTimeout(function(){
            $$.removeClass(the,"touch-event-active");
        },100);
    }

    window.alert = function(str,callback){
        //event.preventDefault();
        if($$.obj(".alert") && $$.obj(".alert")[0]){
            $$.del($$.obj(".alert")[0]);
        }
        str = str.toString();
        var alert = document.createElement("div");
        alert.className = "alert";
        alert.innerHTML = '<div class="alert-tr"><div class="alert-td"><span class="alert-text">'+str.replace(/<[^>]+>/g,"")+'</span></div></div>';
        document.body.appendChild(alert);
        setTimeout(function () {
            try {
                if(alert) alert.className += " alert-show";
            }catch (err){
                console.log(err);
            }
        },5);
        setTimeout(function () {
            try {
                if(alert){
                    alert.className = alert.className.replace(" alert-show","") + " alert-dis";
                }
            }catch (err){
                console.log(err);
            }
        },2500);
        setTimeout(function(){
            try {
                if(alert) $$.del(alert);
                if(typeof callback === "function") callback();
            }catch (err){
                console.log(err);
            }
        },3300);
    };

    window.confirm = function(str,options,single_callback){
        options = {
            title : options && options.title  || "系统提示",
            reset : options && options.callback && typeof(eval(options.callback))=="function" ? [options && options.reset || "取消"]:[options && options.reset || "知道了"],
            sure  : options && options.sure  || "确定",
            callback : options && options.callback || null
        };
        if($$.obj(".confirm") && $$.obj(".confirm")[0]){
            $$.del($$.obj(".confirm")[0]);
        }
        var confirm = document.createElement("div");
        var handle_str = '<span class="confirm-reset touch-event">'+options.reset+'</span>';
        try{
            if(typeof(eval(options.callback))=="function"){
                handle_str += '<span class="confirm-sure touch-event">'+options.sure+'</span>';
                confirm.className = "confirm";
            }else{
                confirm.className = "confirm confirm-single";
            }
        }catch(err){
            confirm.className = "confirm confirm-single";
        }
        //confirm.className = "confirm";
        confirm.innerHTML = '<div class="confirm-tr">'+
            '<div class="confirm-td">'+
            '<div class="confirm-box">'+
            '<div class="confirm-title">'+options.title+'</div>'+
            '<div class="confirm-content">'+str+'</div>'+
            '<div class="confirm-handle">'+handle_str+
            '</div>'+
            '</div>'+
            '</div>'+
            '</div>';
        document.body.appendChild(confirm);

        try{
            if(typeof(eval(options.callback))=="function"){
                $$.obj(".confirm-reset")[0].onclick = function() {
                    options.callback(0);
                    $$.del(confirm);
                };
                $$.obj(".confirm-sure")[0].onclick = function() {
                    options.callback(1);
                    $$.del(confirm);
                };
            }else{
                $$.obj(".confirm-reset")[0].onclick = function() {
                    if(typeof single_callback == "function") single_callback();
                    $$.del(confirm);
                };
            }
        }catch(err){
            $$.obj(".confirm-reset")[0].onclick = function() {
                $$.del(confirm);
            };
            console.log(err);
        }
    };

    window.loading = function(bool,str){
        if($$.obj(".loading") && $$.obj(".loading")[0]){
            $$.del($$.obj(".loading")[0]);
        }
        if(!bool || bool == "on"){
            //开启
            str = str || "请稍后";
            var _loading = document.createElement("div");
            _loading.className = "loading";
            _loading.innerHTML = '<div class="loading-tr"><div class="loading-td"><div class="loading-box"><span class="loading-gif"><span class="loading-spinner"> <em class="loading-rect1"></em> <em class="loading-rect2"></em> <em class="loading-rect3"></em> <em class="loading-rect4"></em> <em class="loading-rect5"></em> </span></span><span class="loading-text">'+str.toString().replace(/<[^>]+>/g,"")+'</span></div></div></div>';
            document.body.appendChild(_loading);
            setTimeout(function(){
                try {
                    loading("off");
                }catch (err){}
            },10000);
        }
    }
})();