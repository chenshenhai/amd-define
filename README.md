# amd-define

### JavaScript从零实现AMD模块规范的核心代码

> 注：通过模块id加载

> 楔子：在JavaScript框架的花花世界，如果想要学习框架的原理，除了会使用框架外，还需要在使用的基础上，懂得用最原生的JavaScript代码实现框架的核心功能，想要在JavaScript有所突破的话，不要迷恋使用框架！不要迷恋使用框架！不要迷恋使用框架！重要事情说三遍！！！

> 注：如果嫌文章太长可以直接点击看源码demo [https://github.com/ChenShenhai/amd-define](https://github.com/ChenShenhai/amd-define)

## 1.  规划好各部分代码

```javascript
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
    AMD.define = function(name, dependencies, factory){ };

    /*
    * 发射模块
    * @name emit
    * @param {string} name 模块名字
    * @return {}
    * */
    AMD.emit = function(name){ };

    /*
    * 模块获取
    * @name require
    * @param {string} name 模块名字
    * */
    AMD.require = function(name) { };

    global.define = function(name, dependencies, factory){
        AMD.define(name, dependencies, factory)
    };

    global.require = function(name ){
        return AMD.require(name )
    };

})(window);
```

> 从上面代码可以看出，模块加载先分为四个部分，模块缓存池、模块定义器、模块发射器、模块获取器
> * 模块缓存池：moduleStroage主要是用来存放define定义的模块，包括自执行的匿名模块。
> * 模块定义器：用来定义模块的内容，包括模块名name，模块依赖dependencies，模块执行代码factory，定义后的模块将打包整合到模块缓存池moduleStroage中。
> * 模块发射器：根据模块名用来执行或包装模块实体和模块依赖实体。
> * 模块获取器：可以直接通过模块名获取模块实体。

## 2. 实现模块化各部分代码

### 2.1 模块定义器

```javascript
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

``` 
> 其中需要判断三个参数是否齐全
> * define(name, dependencies, factory)：则定义有依赖模块
> * define(name, factory)：定义无依赖模块
> * define(dependencies, factory)：定义有依赖自执行模块
> * define(factory)：定义无依赖自执行模块

### 2.2 模块发射器

```javascript
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
```

> 模块发射器还有个作用是通过模块定义的依赖，将模块依赖转成实体模块并且通过apply拓展到主模块执行代码的对应依赖参数中



### 2.3 模块获取器

```javascript
   /*
    * 模块获取
    * @name require
    * @param {string} name 模块名字
    * */
    AMD.require = function(name) {
        return this.emit(name);
    };
```

> 可以直接通过模块名称获取模块实例，返回模块实例可以直接使用，用法和require.js一致


## 3. 测试demo

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>define-demo</title>
</head>
<body>
<script src="amd-define.js"></script>
<script>
    define("test-1", [], function(){
        return {
            name : "test-1",
            func : function(){
                console.log("test-1");
                document.write("<p>test-1</p>");
            }
        }
    });

    define("test-2", function(){
        return {
            name : "test-2",
            func : function(){
                console.log("test-2");
                document.write("<p>test-2</p>");
            }
        }
    });

    define(["test-1", "test-2"], function(t1, t2){
        console.log("exec module-1");
        document.write("<p>exec module-1</p>");
        t1.func();
        t2.func();
    });

    define(function(){
        console.log("exec module-2");
        document.write("<p>exec module-2</p>");
    })

</script>
</body>

</html>
```

## 4. 源码地址
[https://github.com/ChenShenhai/amd-define](https://github.com/ChenShenhai/amd-define)

> 更多技术交流可以联系 cshenhai@gmail.com
