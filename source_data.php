<?php
    ini_set('date.timezone','Asia/Shanghai');

    Session_start();

    header("Content-type:text/html;charset=utf-8");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Origin: *");

    echo json_encode(array(
                "icbc"=>array(
                    "full_name"=>"中国工商银行",
                    "name"=>"工商银行",
                    "tel"=>"95588",
                    "match_reg"=>"/.*[收入](.*?)[元]/"
                ),
                "abc"=>array(
                    "full_name"=>"中国农业银行",
                    "name"=>"农业银行",
                    "tel"=> "95599",
                    "match_reg"=>"/.*[转存交易人民币|代付交易人民币](.*?)[，余额]/"
                ),
                "boc"=> array(
                    "full_name"=>"中国银行",
                    "name"=>"中国银行",
                    "tel"=> "95566",
                    "match_reg"=>"/.*[收入](.*?)[元]/"
                ),
                "ccb"=> array(
                    "full_name"=>"中国建设银行",
                    "name"=>"建设银行",
                    "tel"=> "95533",
                    "match_reg"=>"/.*[收入人民币](.*?)[元]/"
                ),
                "bc"=> array(
                    "full_name"=>"交通银行",
                    "name"=>"交通银行",
                    "tel"=> "95559",
                    "match_reg"=>"/.*[转入](.*?)[元]/"
                ),
                "cmb"=> array(
                    "full_name"=>"招商银行",
                    "name"=>"招商银行",
                    "tel"=> "95555",
                    "match_reg"=>"/.*[转入人民币](.*?)[，付方]/"
                ),
                "citic"=> array(
                    "full_name"=>"中信银行",
                    "name"=>"中信银行",
                    "tel"=> "95558"
                ),
                "spdb"=> array(
                    "full_name"=>"上海浦东发展银行",
                    "name"=>"浦发银行",
                    "tel"=> "95528"
                ),
                "cib"=> array(
                    "full_name"=>"兴业银行",
                    "name"=>"兴业银行",
                    "tel"=> "95561"
                ),
                "cmsb"=> array(
                    "full_name"=>"中国民生银行",
                    "name"=>"民生银行",
                    "tel"=> "95568"
                ),
                "psbc"=> array(
                    "full_name"=>"中国邮政储蓄银行",
                    "name"=>"中国邮政",
                    "tel"=> "95580",
                    "match_reg"=>"/.*[存款金额](.*?)[元]/"
                ),
                "ceb"=> array(
                    "full_name"=>"中国光大银行",
                    "name"=>"光大银行",
                    "tel"=> "95595",
                    "match_reg"=>"/.*[转入|存入](.*?)[元]/"
                ),
                "pingan"=> array(
                    "full_name"=>"平安银行股份有限公司",
                    "name"=>"平安银行",
                    "tel"=> "95511"
                ),
                "hb"=> array(
                    "full_name"=>"华夏银行",
                    "name"=>"华夏银行",
                    "tel"=> "95577",
                    "match_reg"=>"/.*[到账人民币](.*?)[元]/"
                ),
                "bob"=> array(
                    "full_name"=>"北京银行股份有限公司",
                    "name"=>"北京银行",
                    "tel"=> "95526"
                ),
                "bosc"=> array(
                    "full_name"=>"上海银行股份有限公司",
                    "name"=>"上海银行",
                    "tel"=> "95594"
                ),
                "cgb"=> array(
                    "full_name"=>"广发银行股份有限公司",
                    "name"=>"广发银行",
                    "tel"=> "95508",
                    "match_reg"=>"/.*[收入人民币](.*?)[元]/"
                ),
                "jsb"=> array(
                    "full_name"=>"江苏银行",
                    "name"=>"江苏银行",
                    "tel"=> "95319"
                ),
                "czb"=> array(
                    "full_name"=>"浙商银行股份有限公司",
                    "name"=>"浙商银行",
                    "tel"=> "95527"
                ),
                "hfb"=> array(
                    "full_name"=>"恒丰银行股份有限公司",
                    "name"=>"恒丰银行",
                    "tel"=> "95395"
                ),
                "njb"=> array(
                    "full_name"=>"南京银行股份有限公司",
                    "name"=>"南京银行",
                    "tel"=> "95302"
                ),
                "cqrcb"=> array(
                    "full_name"=>"重庆农村商业银行",
                    "name"=>"重庆农村商业银行",
                    "tel"=> "95389"
                ),
                "hsb"=> array(
                    "full_name"=>"徽商银行股份有限公司",
                    "name"=>"徽商银行",
                    "tel"=> "96588"
                ),
                "nbcb"=> array(
                    "full_name"=>"宁波银行股份有限公司",
                    "name"=>"宁波银行",
                    "tel"=> "95574"
                )
        ));