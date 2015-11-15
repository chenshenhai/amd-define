/**
 * Created by ChenShenhai on 2015/11/15.
 */
(function(global){


    var AMD = {};

    //模块缓存池
    var moduleStorage = {};

    /*
    * 模块定义
    * @name define
    * @param {string} name 模块名字
    * @param {array} dependencies 模块依赖
    * @param {function} factory 模块方法
    * @return {object}
    * */
    AMD.define = function(name, dependencies, factory){

        var that = this;

        var _name, _dependencies, _factory;
        var _exec = false;

        //三个参数都齐全
        if( factory ) {
            _name = name;
            _dependencies = dependencies;
            _factory = factory;
        } else {
            //两个参数时
            if( dependencies ) {
                //name 和 factory
                if( typeof name === "string" && typeof dependencies === "function") {
                    _name = name;
                    _dependencies = [];
                    _factory = dependencies;
                }
                //dependencies 和 factory，同时函数自执行
                else if( name instanceof Array && typeof dependencies === "function" ) {
                    _dependencies = name;
                    _factory = dependencies;
                    _name = "temp-" + new Date().getTime();
                    _exec = true;
                }

            } else {
                //只有一个参数时，模块代码自执行
                if( typeof name === "function") {
                    _name = "temp-" + new Date().getTime();
                    _dependencies = [];
                    _factory = name;
                    _exec = true;
                } else {
                    return false;
                }
            }
        }

        if( !moduleStorage.hasOwnProperty(_name) ) {
            var _module = {
                name : _name,
                dependencies : _dependencies,
                factory : _factory
            };

            moduleStorage[_name] = _module;
        }


        if( _exec ) {
            that.emit(_name);
        } else {
            return moduleStorage[_name];
        }
    };


    /*
    * 发射模块
    * @name emit
    * @param {string} name 模块名字
    * @return {}
    * */
    AMD.emit = function(name){
        var that = this;
        var module = moduleStorage[name];

        if( typeof module.entity === "undefined") {
            var _args = [];

            for( var i= 0, len=module.dependencies.length; i<len; i++ ) {
                var _entity = module.dependencies[i].entity;

                if( typeof _entity !== "undefined" ) {
                    _args.push(_entity);
                    console.log(_entity);
                } else {
                    _args.push(that.emit(module.dependencies[i]));
                    console.log(that.emit(module.dependencies[i]));
                }
            }
            module.entity = module.factory.apply(function(){}, _args);


        }

        return module.entity;
    };

    /*
    * 模块获取
    * @name require
    * @param {string} name 模块名字
    * */
    AMD.require = function(name) {
        return this.emit(name);
    };


    //TODO
    //global.AMD = AMD;
    //AMD.debug = {
    //    getModuleStroage : function() {
    //        console.log(moduleStorage);
    //    }
    //};

    global.define = function(name, dependencies, factory){
        AMD.define(name, dependencies, factory)
    };

    global.require = function(name ){
        return AMD.require(name )
    };



})(window);