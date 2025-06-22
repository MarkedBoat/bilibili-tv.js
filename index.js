
// --> /data/codes/advanced/frontend/web/static/js/hammer/kl-hammer.js
/**
 * Created by markedboat on 2019/12/19.
 */
"use strict";
/*jshint esversion: 6 */
/*globals document,console,window,XPathResult,XMLHttpRequest,FormData,HTMLElement,Option,URLSearchParams */
/* exported Emt,domLoaded */


// Object.prototype.isStdArray = function () {
//     return typeof this.forEach === 'function';
// };
if (window.hasKl === undefined) {
    window.hasKl = true;

    let hasKl = false;
    try {
        let kl = kl || undefined;
        hasKl = true;
    } catch (e) {
        let kl = undefined;

    }
    if (hasKl === false) {
        var kl = {
            opt: {log: true},
            log: console.log,
            warrning: console.warn,
            error: console.error,

            __log: console.log,
            __warn: console.warn,
            __error: console.error,


            isset: function (arg) {
                return typeof arg !== 'undefined';
            },
            id: function (id) {
                return document.getElementById(id);
            },

            getValByPath: function (object, keysPath, defaultVal) {
                if (object === undefined) {
                    return defaultVal || undefined;
                }

                let keys = keysPath.replace(/\]\[/ig, '.').replace(/\]/ig, '').replace(/\[/ig, '.').split('.').filter(v => {
                    return v.length > 0;
                });
                if (keys.length === 0) {
                    return object;
                }
                let last = keys.splice(-1);
                let last_obj = [object].concat(keys).reduce(function (a, b) {
                    return (a[b] === undefined || typeof a[b] !== 'object') ? {} : a[b];
                });
                if (defaultVal === undefined) {
                    return ((last_obj[last] === null) ? undefined : last_obj[last]);
                } else {
                    return ((last_obj[last] === null) ? undefined : last_obj[last]) || defaultVal;
                }

            },
            setValByPath: function (object, keysPath, value) {
                let keys = keysPath.split('.');
                let last = keys.splice(-1);
                [object].concat(keys).reduce(function (a, b) {
                    if (a[b] === undefined) a[b] = {};
                    return a[b];
                })[last] = value;
                return kl;
            },

            isUndefined: function (baseVar, attr_path) {
                let tmp_ar = attr_path.split('.');
                return tmp_ar.reduce(function (base_var, attr) {
                    // kl.log(base_var, attr, base_var[attr], 'xxxx');
                    return base_var === undefined || base_var === null || typeof base_var[attr] === 'undefined' ? undefined : base_var[attr];
                }, baseVar) === undefined;
            },
            xpathSearch: function (xpath, context) {
                let nodes = [];
                try {
                    let doc = (context && context.ownerDocument) || window.document;
                    let results = doc.evaluate(xpath, context || doc, null, XPathResult.ANY_TYPE, null);
                    let node;
// while (node = results.iterateNext()) {
//                 nodes.push(node);
//             }
                    while (true) {
                        node = results.iterateNext();
                        if (node) {
                            nodes.push(node);
                        } else {
                            break;
                        }
                    }
                } catch (e) {
                    throw e;
                }
                return nodes;
            },
            /**
             * json 解码
             * <br>!!!只要原参数是 object ，不会检查是不是数组
             * @param sourceData
             * @param defaultValue
             * @returns {{}|any}
             */
            jsonDecode: function (sourceData, defaultValue) {
                if (sourceData === null || sourceData === undefined) {
                    return defaultValue;
                }
                let sourceDataType = typeof sourceData;
                let res;
                if (sourceDataType === 'string') {
                    try {
                        res = JSON.parse(sourceData);
                        return res;
                    } catch (e) {
                        return defaultValue;
                    }
                } else {
                    if (sourceDataType === 'object') {
                        return sourceData;
                    }
                    return defaultValue;
                }
            },


            getCookie: function (cookie_name) {
                let cks = document.cookie.split(';');
                for (let i = 0; i < cks.length; i++) {
                    if (cks[i].search(cookie_name) !== -1) {
                        return decodeURIComponent(cks[i].replace(cookie_name + '=', ''));
                    }
                }
            },

            setCookie: function (name, val, day, domain) {
                let date = new Date();
                date.setTime(date.getTime() + day * 24 * 3600 * 1000);
                let time_out = date.toGMTString();
                //kl.log(time_out, val);
                document.cookie = name + '=' + encodeURIComponent(val) + ';expires=' + time_out + ';path=/;domain=' + domain;
            },
            /**
             * 将多维 object 转化成 from的key=>name
             * @param fromData
             * @param input_data
             * @param level
             * @param name_root
             */
            data2form: function (fromData, input_data, level, name_root) {
                if (level === 0) {
                    for (let k in input_data) {
                        if (typeof input_data[k] === 'object') {
                            kl.data2form(fromData, input_data[k], 1, k);
                        } else {
                            fromData.append(k, input_data[k]);
                        }
                    }
                } else {
                    for (let k in input_data) {
                        if (typeof input_data[k] === 'object') {
                            kl.data2form(fromData, input_data[k], level + 1, name_root + '[' + k + ']');
                        } else {
                            fromData.append(name_root + '[' + k + ']', input_data[k]);
                        }
                    }
                }
            },


            /**
             * 将多维 object 转化成 from的key=>name
             * @param dstList
             * @param input_data
             * @param level
             * @param name_root
             */
            data2list: function (dstList, input_data, level, name_root) {
                if (level === 0) {
                    for (let k in input_data) {
                        if (typeof input_data[k] === 'object') {
                            kl.data2list(dstList, input_data[k], 1, k);
                        } else {
                            dstList.push({key: k, val: input_data[k]});
                        }
                    }
                } else {
                    for (let k in input_data) {
                        if (typeof input_data[k] === 'object') {
                            kl.data2list(dstList, input_data[k], level + 1, name_root + '[' + k + ']');
                        } else {
                            dstList.push({key: name_root + '[' + k + ']', val: input_data[k]});
                        }
                    }
                }
            },


            /**
             *
             * @param opts
             */
            ajax: function (opts) {
                let request = new XMLHttpRequest();
                opts.httpOkCodes = opts.httpOkCodes || [200];
                if (opts.httpOkCodes.indexOf(200) === -1) {
                    opts.httpOkCodes.push(200);
                }
                request.timeout = (opts.timeout || 30) * 1000;
                request.responseType = opts.responseType || request.responseType;
                //opts.xhrSetting.withCredentials 设置运行跨域操作
                if (typeof opts.xhrSetting === 'object') {
                    for (let key in opts.xhrSetting) {
                        request[key] = opts.xhrSetting[key]; // 设置运行跨域操作
                    }
                }

                if (opts.async !== true) {
                    request.addEventListener("load", function () {
                        if (typeof opts.onload === 'function') {
                            opts.onload(request);
                        } else {
                            if (opts.httpOkCodes.indexOf(request.status) !== -1) {
                                let result = request.responseText;
                                if (opts.type === 'json') {
                                    try {
                                        result = JSON.parse(request.responseText);
                                    } catch (e) {
                                        if (opts.error) {
                                            opts.error('请求结果不能保存为 json');
                                        }
                                    }
                                }
                                opts.success(result);
                            } else {
                                if (opts.error) {
                                    opts.error(request.status + ':' + request.statusText);
                                }
                            }
                        }

                    }, false);
                }

                request.addEventListener("timeout", function () {
                    kl.log('出错了');
                    if (opts.error) opts.error(request.statusText, 'timeout');
                }, false);

                request.addEventListener("error", function () {
                    kl.log('出错了');
                    if (opts.error) opts.error(request.statusText, 'error');
                }, false);

                request.addEventListener("abort", function () {
                    kl.log('中断了');
                    if (opts.error) opts.error(request.statusText, 'abort');
                }, false);

                if (opts.progress) {
                    request.upload.addEventListener("progress", function (evt) {
                        if (evt.lengthComputable) {
                            opts.progress(evt.loaded, evt.total);
                        }
                    }, false);
                }


                //request.onreadystatechange = requestCallback;
                opts.form = opts.form || new FormData();
                if (opts.data) {
                    kl.data2form(opts.form, opts.data, 0, '');
                }

                if (opts.method === 'GET') {
                    let str = (new URLSearchParams(opts.form).toString());
                    opts.url = opts.url.indexOf('?') === -1 ? `${opts.url}?${str}` : `${opts.url}&${str}`;
                }

                request.open((opts.method || "POST"), opts.url, true);
                if (opts.isAjax !== false) {
                    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                }
                //request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                if (opts.headers && typeof opts.headers.forEach === 'function') {
                    opts.headers.forEach((header_ar) => {
                        request.setRequestHeader(header_ar[0], header_ar[1]);
                    });
                }


                if (opts.async === true) {
                    return new Promise(function (resolve) {
                        request.send(opts.form);
                        request.onload = function () {
                            if (request.status === 200 || opts.httpOkCodes.indexOf(request.status) !== -1) {
                                let result = request.responseText;
                                if (opts.type === 'json') {
                                    try {
                                        result = JSON.parse(request.responseText);
                                    } catch (e) {
                                        return resolve({isOk: false, msg: 'json结构异常', request: {status: request.status, statusText: request.statusText, responseText: request.responseText}});
                                    }
                                }
                                //return resolve({isOk: true, result: result});
                                return resolve({isOk: true, result: result, request: {status: request.status, statusText: request.statusText, responseText: request.responseText}});
                            } else {
                                return resolve({isOk: false, msg: '请求异常', request: {status: request.status, statusText: request.statusText, responseText: request.responseText}});
                                //return reject(request.status + ':' + request.statusText);
                            }
                        };
                    });
                } else {
                    request.send(opts.form);
                }
                return request;
            },
            getStack: function () {
                //    kl.log.apply(function(){},arguments)
                return new Error().stack.replace('Error', 'Stack');
            },

            HTML: {
                lib: {
                    tableCellResize: {
                        hasAddEventListener: false,
                        isResizing: false,
                        currentResizer: false,
                        startX: 0,
                        startWidth: 0,
                        handleKlTableCellResizeMouseMove: function (e) {
                            // kl.log('mouse move',isResizing,currentResizer);
                            if (!kl.HTML.lib.tableCellResize.isResizing || !kl.HTML.lib.tableCellResize.currentResizer) {
                                return false;
                            }
                            const width = kl.HTML.lib.tableCellResize.startWidth + e.clientX - kl.HTML.lib.tableCellResize.startX;
                            kl.HTML.lib.tableCellResize.currentResizer.parentElement.style.width = width + 'px';
                        },

                        stopKlTableCellResizeResize: function () {
                            kl.HTML.lib.tableCellResize.isResizing = false;
                            kl.HTML.lib.tableCellResize.currentResizer = false;
                            //   document.removeEventListener('mousemove', handleKlTableCellResizeMouseMove);
                            //   document.removeEventListener('mouseup', stopKlTableCellResizeResize);
                        },
                        init: function () {
                            if (kl.HTML.lib.tableCellResize.hasAddEventListener === true) {
                                return false;
                            }
                            kl.HTML.lib.tableCellResize.hasAddEventListener = true;
                            document.addEventListener('mousemove', kl.HTML.lib.tableCellResize.handleKlTableCellResizeMouseMove);
                            document.addEventListener('mouseup', kl.HTML.lib.tableCellResize.stopKlTableCellResizeResize);

                            document.body.addNodes([
                                kl.HTML.STYLE().setPros({
                                    innerHTML: `
        .kl-table {
            border-collapse: collapse;
            width: 100%;
        }

        .kl-table th, .kl-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            position: relative;
        }

        .kl-table .kl-cell-resizer {
            position: absolute;
            top: 0;
            right: 0;
            width: 5px;
            height: 100%;
            cursor: col-resize;
        }
                        `
                                }),
                            ]);
                        }
                    },
                    drag: {
                        hasAddEventListener: false,
                        currDrag: false,
                        currHook: false,
                        hookKV: {
                            //flag:  {flag:falg,state: true},
                        },
                        common: {
                            addDraggingStyle: (e) => {
                                e.target.classList.add('kl-in-dragging');
                            },
                            removeDraggingStyle: (e) => {
                                e.target.classList.remove('kl-in-dragging');
                            },
                            addHoverStyle: (e) => {
                                e.target.classList.add('kl-drag-hover');
                            },
                            removeHoverStyle: (e) => {
                                e.target.classList.remove('kl-drag-hover');
                            },
                        },
                        addHook: function (flag, opt) {
                            console.log(flag, opt);
                            kl.HTML.lib.drag.init();
                            if (kl.HTML.lib.drag.hookKV[flag]) {
                                kl.error('hooks.flag重复', flag);
                                return false;
                            }
                            opt = opt || {};
                            let tmp = {flag: flag, state: true,};
                            tmp.drag = opt.drag || {};
                            tmp.drag.start = tmp.drag.start || {};
                            tmp.drag.end = tmp.drag.end || {};
                            tmp.drag.hoverIn = tmp.drag.hoverIn || {};
                            tmp.drag.hoverOut = tmp.drag.hoverOut || {};
                            tmp.drop = opt.drop || {};

                            tmp.drag.start.filter = tmp.drag.start.filter || function () {
                                return true;
                            };
                            tmp.drag.start.call = tmp.drag.start.call || kl.HTML.lib.drag.common.addDraggingStyle;

                            tmp.drag.end.filter = tmp.drag.end.filter || function () {
                                return true;
                            };
                            tmp.drag.end.call = tmp.drag.end.call || kl.HTML.lib.drag.common.removeDraggingStyle;


                            tmp.drag.hoverIn.filter = tmp.drag.hoverIn.filter || function (e) {
                                //   e.preventDefault(); // 必须阻止默认行为
                                return true;
                            };
                            tmp.drag.hoverIn.call = tmp.drag.hoverIn.call || kl.HTML.lib.drag.common.addHoverStyle;


                            tmp.drag.hoverOut.filter = tmp.drag.hoverOut.filter || function () {
                                return true;
                            };
                            tmp.drag.hoverOut.call = tmp.drag.hoverOut.call || kl.HTML.lib.drag.common.removeHoverStyle;


                            tmp.drop.filter = tmp.drop.filter || function () {
                                return true;
                            };
                            tmp.drop.call = tmp.drop.call || function (e) {
                                e.preventDefault();
                                kl.log(kl.HTML.lib.drag.currDrag);
                            };

                            kl.HTML.lib.drag.hookKV[flag] = tmp;
                            kl.log('addHook', tmp, kl.HTML.lib.drag.hookKV);
                        },
                        disableHook: function (flag) {
                            if (kl.HTML.lib.drag.hookKV[flag]) {
                                kl.HTML.lib.drag.hookKV[flag].state = false;
                            }

                        },
                        enableHook: function (flag) {
                            if (kl.HTML.lib.drag.hookKV[flag]) {
                                kl.HTML.lib.drag.hookKV[flag].state = true;
                            }
                        },
                        /**
                         *  添加一个拖拽钩子
                         *  @param {string} flag 钩子标识
                         *  @param {object} opt 钩子配置
                         *  @param {function} opt.call drop事件的回调
                         *  @param {string} opt.srcClassname 可以拖拽的classname,用于帅选
                         *  @param {string} opt.dstClassname 可以放置的 classname，用于筛选
                         *  @param {string} opt.draggingClassname 拖拽中的样式 classname
                         *  @param {string} opt.hoverClassname 可以防止的样子 classname
                         *
                         *  */
                        addSimpleHook: function (flag, opt) {
                            opt = opt || {};
                            let draggingElement;
                            let srcClassname = opt.srcClassname || 'drag-src-item';
                            let dstClassname = opt.dstClassname || 'drag-dst-item';
                            let draggingClassname = opt.draggingClassname || 'kl-in-dragging';
                            let hoverClassname = opt.hoverClassname || 'kl-drag-hover';
                            let call = opt.call || function (srcElement, dstElement) {
                                kl.log({srcElement: srcElement, dstElement: dstElement});
                            };

                            console.log(opt, srcClassname, opt.srcClassname, opt.srcClassname || 'drag-src-item');

                            let srcFilter = (e, eventType) => {
                                let res = e.target.classList.contains(srcClassname);
                                //   kl.log('srcFilter:', eventType, e.target, res,srcClassname);
                                return res;
                            };
                            let dstFilter = (e, eventType) => {
                                let res = e.target.classList.contains(dstClassname) && e.target !== draggingElement;
                                //  kl.log('dstFilter:', eventType, e.target, res,dstClassname);
                                return res;
                            };

                            kl.HTML.lib.drag.addHook(flag, {
                                drag: {
                                    start: {
                                        filter: srcFilter,
                                        call: function (e) {

                                            draggingElement = e.target;
                                            draggingElement.classList.add(draggingClassname);
                                            //  kl.log('start:', e.target);
                                        },
                                    },
                                    end: {
                                        filter: srcFilter,
                                        call: function (e) {
                                            //  kl.log('end:', e.target);
                                            draggingElement.classList.remove(draggingClassname);
                                            draggingElement = false;
                                        },
                                    },
                                    hoverIn: {
                                        filter: dstFilter,
                                        call: function (e) {
                                            e.target.classList.add(hoverClassname);
                                        },
                                    },
                                    hoverOut: {
                                        filter: () => {
                                            return true;
                                        },
                                        call: function (e) {
                                            e.target.classList.remove(hoverClassname);
                                        },
                                    },
                                },
                                drop: {
                                    filter: dstFilter,
                                    call: function (e) {
                                        let targetTagElement = e.target;
                                        e.target.classList.remove(hoverClassname);
                                        // kl.log('drag->dropOn', draggingElement, targetTagElement);
                                        call(draggingElement, targetTagElement);
                                    },
                                },
                            });

                        },
                        init: function () {
                            if (kl.HTML.lib.drag.hasAddEventListener === true) {
                                kl.warn('drag.hasAddEventListener', true);
                                return false;
                            }
                            // 全局监听拖拽事件
                            document.addEventListener('dragstart', (e) => {
                                for (const [flag, hook] of Object.entries(kl.HTML.lib.drag.hookKV)) {
                                    if (hook.state === true && hook.drag.start.filter(e, 'dragstart')) {
                                        kl.HTML.lib.drag.currHook = hook;
                                        hook.drag.start.call(e);
                                    }
                                }
                            });

                            document.addEventListener('dragend', (e) => {
                                if (kl.HTML.lib.drag.currHook && kl.HTML.lib.drag.currHook.state === true && kl.HTML.lib.drag.currHook.drag.end.filter(e, 'dragend')) {
                                    kl.HTML.lib.drag.currHook.drag.end.call(e);
                                    kl.HTML.lib.drag.currHook = false;
                                }
                            });

                            document.addEventListener('dragover', (e) => {
                                if (kl.HTML.lib.drag.currHook.state === true && kl.HTML.lib.drag.currHook.drag.hoverIn.filter(e)) {
                                    //console.log('dragover:', e.target, e);
                                    e.preventDefault(); // 必须是  dragover 和   preventDefault,才能  阻止默认行为以允许放置 ，不然不能放置
                                    kl.HTML.lib.drag.currHook.drag.hoverIn.call(e, 'dragover');
                                }
                            });

                            document.addEventListener('dragleave', (e) => {
                                //  console.log('dragleave:', e.target, e);

                                if (kl.HTML.lib.drag.currHook.state === true && kl.HTML.lib.drag.currHook.drag.hoverOut.filter(e)) {
                                    kl.HTML.lib.drag.currHook.drag.hoverOut.call(e);
                                }
                            });

                            document.addEventListener('drop', (e) => {
                                //  console.log('drop', e);
                                if (kl.HTML.lib.drag.currHook.state === true && kl.HTML.lib.drag.currHook.drop.filter(e)) {
                                    e.preventDefault();
                                    kl.HTML.lib.drag.currHook.drop.call(e);
                                }
                            });

                            document.body.addNodes([
                                kl.HTML.STYLE().setPros({
                                    innerHTML: `
        .kl-in-dragging {
            border:1px dashed #000 !important;
            box-sizing: border-box;
        } 

        

        .kl-drag-hover {
            border: 0.3em dashed #000 !important;
            box-sizing: border-box; 
        }
       
       
                        `
                                }),
                            ]);

                            kl.HTML.lib.drag.hasAddEventListener = true;
                        }
                    },
                },
                /**
                 @return {HTMLDivElement}
                 */
                DIV: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('div', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLSelectElement}
                 */
                SELECT: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('select', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLInputElement}
                 */
                INPUT: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('input', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLInputElement}
                 */
                INPUT_TEXT: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    attrsStr += ' type="text"';
                    return new Emt('input', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLInputElement}
                 */
                INPUT_NUMBER: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    attrsStr += ' type="number"';
                    return new Emt('input', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return
                 */
                Ymd: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    let span = new Emt('span', '', '', {});
                    attrsStr += ' type="date"';
                    let input = new Emt('input', attrsStr, '', {});
                    let tmp_ymd_obj = {
                        getYmd: function () {
                            let res = parseInt(input.value.replace(/-/ig, ''));
                            if (typeof res === 'number' && !isNaN(res)) {
                                return res;
                            }
                            return 0;
                        },
                        setYmd: function (ymd) {
                            input.value = ymd.toString().replace(/^(\d{4})(\d{2})(\d{2})/ig, '$1-$2-$3');
                        },
                    };

                    span = Object.assign(span, tmp_ymd_obj);
                    //let exp = /^\d+$/;
                    Object.defineProperty(span, 'value', {
                        set: function (v) {
                            tmp_ymd_obj.setYmd(v);
                        },
                        get: function () {
                            return tmp_ymd_obj.getYmd();
                        },
                    });
                    input.setPros(prototypeMap);
                    input.addEventListener('change', () => {
                        span.dispatchEvent(new Event('change'));
                    });

                    return span.addNodes([input]);

                },
                Ym: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    let span = new Emt('span', '', '', {});
                    attrsStr += ' type="month"';
                    let input = new Emt('input', attrsStr, '', {});


                    let tmp_YM_obj = {
                        getYm: function () {
                            let res = parseInt(input.value.replace(/-/ig, ''));
                            if (typeof res === 'number' && !isNaN(res)) {
                                return res;
                            }
                            return 0;
                        },
                        setYm: function (ymd) {
                            input.value = ymd.toString().substring(0, 6).replace(/^(\d{4})(\d{2})/ig, '$1-$2');
                        },
                    };

                    span = Object.assign(span, tmp_YM_obj);
                    //let exp = /^\d+$/;
                    Object.defineProperty(span, 'value', {
                        set: function (v) {
                            tmp_YM_obj.setYmd(v);
                        },
                        get: function () {
                            return tmp_YM_obj.getYmd();
                        },
                    });
                    input.setPros(prototypeMap);
                    input.addEventListener('change', () => {
                        span.dispatchEvent(new Event('change'));
                    });
                    return span.addNodes([input]);
                },
                /**
                 *
                 * @param attrsStr
                 * @param textContent
                 * @param prototypeMap  val:[trueVal,falseVal]
                 * @return {HTMLInputElement}
                 * @constructor
                 */
                CHECKBOX: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    attrsStr += ' type="checkbox"';
                    if (prototypeMap.vals && Array.isArray(prototypeMap.vals)) {
                        let vals = prototypeMap.vals;
                        let val = undefined;
                        if (prototypeMap.value !== undefined) {
                            val = prototypeMap.value;
                            delete prototypeMap.value;
                        }
                        /** @type {HTMLInputElement} */
                        let input = new Emt('input', attrsStr, textContent, prototypeMap);
                        Object.defineProperty(input, 'value', {
                            set: function (v) {
                                input.checked = v.toString() === vals[0].toString();
                            },
                            get: function () {
                                return input.checked === true ? vals[0] : vals[1];
                            },
                        });
                        if (val !== undefined) {
                            input.value = val;
                        }
                        return input;
                    } else {


                        return new Emt('input', attrsStr, textContent, prototypeMap);
                    }
                },
                /**
                 @return {HTMLPreElement}
                 */
                PRE: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('pre', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLLabelElement}
                 */
                LABEL: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('label', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLSpanElement}
                 */
                SPAN: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('span', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLEmbedElement}
                 */
                EM: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('em', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLButtonElement}
                 */
                BUTTON: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('button', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLButtonElement}
                 */
                BUTTON_BUTTON: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    attrsStr += ' type="button"';
                    return new Emt('button', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLButtonElement}
                 */
                BUTTON_SUBMIT: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    attrsStr += ' type="submit"';
                    return new Emt('button', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLTextAreaElement}
                 */
                TEXTAREA: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('textarea', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLAnchorElement}
                 */
                ANCHOR: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('a', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLUListElement}
                 */
                ULIST: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('ulist', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLLIElement}
                 */
                LI: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('li', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLHeadingElement}
                 */
                HEADING: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('heading', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLImageElement}
                 */
                IMAGE: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('image', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLFormElement}
                 */
                FORM: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('form', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLObjectElement}
                 */
                OBJECT: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('object', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLVideoElement}
                 */
                VIDEO: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('video', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLCanvasElement}
                 */
                CANVAS: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('canvas', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLAudioElement}
                 */
                AUDIO: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('audio', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLBRElement}
                 */
                BR: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('br', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLHRElement}
                 */
                HR: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('hr', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLParagraphElement}
                 */
                PARAGRAPH: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('p', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLMenuElement}
                 */
                MENU: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('menu', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLHeadElement}
                 */
                HEAD: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('head', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLBodyElement}
                 */
                BODY: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('body', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLStyleElement}
                 */
                STYLE: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('style', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLScriptElement}
                 */
                SCRIPT: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('script', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLMetaElement}
                 */
                META: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('meta', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLTitleElement}
                 */
                TITLE: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('title', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLDataElement}
                 */
                DATA: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('data', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLTemplateElement}
                 */
                TEMPLATE: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('template', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLDataListElement}
                 */
                DATALIST: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('datalist', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLMeterElement}
                 */
                METER: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('meter', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLOutputElement}
                 */
                OUTPUT: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('output', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLProgressElement}
                 */
                PROGRESS: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('progress', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLDetailsElement}
                 */
                DETAILS: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('details', attrsStr, textContent, prototypeMap);
                },
                /** @returns  {HTMLTableElement & {initResize:function():void }} */
                TABLE: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    let table = new Emt('table', attrsStr, textContent, prototypeMap);
                    let _handle = {
                        initResize: function () {
                            kl.HTML.lib.tableCellResize.init();
                            table.classList.add('kl-table');
                            let ths = Object.values(kl.getValByPath(table, 'tHead.rows.0.cells', {}));
                            ths.forEach(th => {
                                if (th.resizer === undefined) {
                                    th.resizer = kl.HTML.DIV('class="kl-cell-resizer"');
                                    th.addNodes([th.resizer]);
                                    th.resizer.addEventListener('mousedown', function (e) {
                                        //  kl.log('mouse mousedown');
                                        kl.HTML.lib.tableCellResize.isResizing = true;
                                        kl.HTML.lib.tableCellResize.currentResizer = e.target;
                                        kl.HTML.lib.tableCellResize.startX = e.clientX;
                                        kl.HTML.lib.tableCellResize.startWidth = parseInt(window.getComputedStyle(kl.HTML.lib.tableCellResize.currentResizer.parentElement).width, 10);
                                        e.preventDefault();
                                    });
                                }
                            });
                        }
                    };
                    table = Object.assign(table, _handle);
                    return table;
                },
                /**
                 @return {HTMLTableSectionElement}
                 */
                TABLESECTION: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('tablesection', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLTableRowElement}
                 */
                TABLEROW: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('tablerow', attrsStr, textContent, prototypeMap);
                },
                /**
                 @return {HTMLTableCellElement}
                 */
                TABLECELL: function (attrsStr = '', textContent = '', prototypeMap = {}) {
                    return new Emt('tablecell', attrsStr, textContent, prototypeMap);
                },

            },


        };

        Object.defineProperty(kl, '_log', {
            set: function (v) {
                let enable_fns = [];
                if (v === true) {
                    enable_fns = ['log', 'warn', 'error'];
                } else if (typeof v === 'string') {
                    enable_fns = v.split(',');
                } else if (Array.isArray(v)) {
                    enable_fns = v;
                }
                ['log', 'warn', 'error'].forEach(function (fn_str) {
                    if (enable_fns.indexOf(fn_str) >= 0) {
                        kl[fn_str] = kl['__' + fn_str];
                    } else {
                        kl[fn_str] = function () {
                        };
                    }
                });
                return kl;
            },

        });

    }


    if (window.kl === undefined) {
        window.kl = kl;
    }


    kl.log('loaded hammer.js');
}

/**
 *
 * @param tagName
 * @param attrsStr
 * @param textContent
 * @param prototypeMap
 * @returns {HTMLElement }
 * @constructor
 */
function Emt(tagName, attrsStr = '', textContent = '', prototypeMap = {}) {
    let ele = document.createElement(tagName);
    if (typeof attrsStr === 'string') {
        ele.setAttrsByStr(attrsStr, textContent || '');
    }
    if (typeof prototypeMap === 'object') {
        ele.setPros(prototypeMap);
    }
    return ele;
}


HTMLElement.prototype.addNode = function () {
    let self = this;
    for (let i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] !== 'string') {
            this.appendChild(arguments[i]);
            arguments[i].boss = self;
            arguments[i].parent = self;
            if (typeof arguments[i + 1] === 'string') {
                if (arguments[i + 1]) self[arguments[i + 1]] = arguments[i];
            }
        }
    }
    return self;
};

HTMLElement.prototype.addNodes = function (nodes) {
    let self = this;
    if (!Array.isArray(nodes)) {
        nodes = arguments;
    }
    nodes.forEach((node) => {
        if (typeof node === 'string') {
            self.innerHTML += node;
        } else if (node === false) {
            //
        } else {
            node.boss = self;
            self.appendChild(node);
            if (node.eleName) {
                self[node.eleName] = node;
                if (node.eleParent) {
                    node.eleParent [node.eleName] = node;
                }
            }
        }
    });


    return self;
};

HTMLElement.prototype.setStyle = function (configs) {
    for (let attr in configs) {
        this.style[attr] = configs[attr];
    }
    return this;
};
HTMLElement.prototype.setPros = function (configs) {
    for (let attr in configs) {
        this[attr] = configs[attr];
    }
    return this;
};
/**
 * 设置句柄及索引
 * @param {Object} index_handler
 * @param index_name
 * @returns {HTMLElement}
 */
HTMLElement.prototype.setIndexHandler = function (index_handler, index_name) {
    index_handler[index_name] = this;
    this.indexHandler = index_handler;
    return this;
};
HTMLElement.prototype.setAttrs = function (configs, isAddPrototype = false) {
    for (let attr in configs) {
        this.setAttribute(attr, configs[attr]);
    }
    if (isAddPrototype) {
        for (let attr in configs) {
            this[attr] = configs[attr];
        }
    }
    return this;
};
//必须是双引号的
HTMLElement.prototype.setAttrsByStr = function (raw_attrs_str, textContent) {
    let tmp_ar = raw_attrs_str.replace(/=\s?"\s?/g, '=').replace(/"\s+/g, '" ').replace(/\s?:\s?/g, ':').split('" ');
    for (let ar_i = 0; ar_i < tmp_ar.length; ar_i++) {
        let tmp_str = tmp_ar[ar_i];
        let tmp_ar2 = tmp_str.split('=');
        if (tmp_ar2.length === 2) {
            this.setAttribute(tmp_ar2[0].replace(/\s/g, ''), tmp_ar2[1].replace(/(^\s)|(\s$)|"/g, ''));
        }
    }
    if (typeof textContent === 'string') {
        this.textContent = textContent;
    }
    return this;
};

HTMLElement.prototype.setEventListener = function (event, fn) {
    this.addEventListener(event, fn);
    return this;
};
HTMLElement.prototype.bindEvent = function (event, fn) {
    this.addEventListener(event, fn);
    return this;
};
/**
 * 获取父元素
 * @param deep
 * @return {HTMLElement[]|*[]}
 */
HTMLElement.prototype.getParentElements = function (deep) {
    deep = deep || 10;
    let parentELements = [];
    let cur = this;
    for (let i = 0; i < deep; i++) {
        if (cur.parentElement) {
            parentELements.push(cur.parentElement);
            cur = cur.parentElement;
        } else {
            break;
        }
    }
    return parentELements;
};
/** 获取一个父元素
 * return {HTMLElement|*|false}
 * */
HTMLElement.prototype.filterOneParentElement = function (filterFn, deep) {
    deep = deep || 10;
    let cur = this;
    let match = false;
    for (let i = 0; i < deep; i++) {
        if (cur.parentElement) {
            if (filterFn(cur) === true) {
                match = cur;
                break;
            }
            cur = cur.parentElement;
        } else {
            break;
        }
    }
    return match;
};

/**
 *
 * @param opts
 let opts = {
 path: 'premit.startTime',
 domData: domData
 }
 * @returns {HTMLElement}
 */
HTMLElement.prototype.bindData = function (opts) {
    opts.ele = this;
    opts.domData.bindData(opts);
    return this;
};


HTMLElement.prototype.toggleClassList = function (class_name, is_add) {
    if (typeof is_add === 'undefined') {
        this.classList.toggle(class_name);
    } else if (is_add) {
        this.classList.add(class_name);
    } else {
        this.classList.remove(class_name);
    }
    return this;
};

HTMLElement.prototype.select_item_vals = [];
HTMLElement.prototype.select_item_eles = [];

HTMLElement.prototype.addSelectItem = function (val, text, is_default) {
    let self = this;
    if (self.tagName === 'SELECT') {
        if (self.select_item_vals.indexOf(val) === -1) {
            self.select_item_vals.push(val);
            let opt = new Option(text, val);
            opt.is_default = is_default;
            opt.val = val;
            self.select_item_eles.push();
            self.add(opt);
            if (is_default) {
                self.value = val;
            }
        }
    } else {
        kl.log('调用错误，非select 不能使用 addSelectItem 方法');
    }
    return self;
};
/**
 *
 * @param list [ {val:xx,text:xx,is_default:true/false} ]
 * @returns {HTMLElement}
 */
HTMLElement.prototype.addSelectItemList = function (list) {
    let self = this;
    if (typeof list.forEach === 'function') {
        list.forEach(function (info) {
            self.addSelectItem(info.val || '', info.text || '', info.is_default || '');
        });
    }
    return this;
};
HTMLElement.prototype.clearSelectItems = function (keep_default) {
    let self = this;
    let index0 = 0;
    for (let i in self.select_item_eles) {
        if (keep_default === true && self.select_item_eles[index0].is_default === true) {
            kl.log('保留', i, index0, self.select_item_eles[index0]);
            index0 = index0 + 1;
        }
        self.select_item_eles[index0].remove();
    }
    if (self.select_item_eles.length > 0) {
        if (keep_default === true) {
            self.select_item_vals = [self.select_item_eles[0].val];
        } else {
            self.select_item_vals = [];
        }
    }

};

HTMLElement.prototype.removeAllChildNodes = function () {
    let es = Object.values(this.children);
    es.forEach((e) => {
        e.remove();
    });
};

HTMLSelectElement.prototype.setItems = function (items, selected_key) {
    let self = this;
    if (Array.isArray(items)) {
        items.forEach(function (item) {
            self.add(new Option(item.text, item.val));
        });
    }
    if (selected_key !== undefined) {
        self.value = selected_key;
    }
    return self;

};

Object.defineProperty(HTMLSelectElement.prototype, "setItems", {enumerable: false,});
/** *
 * @param items
 * @return {HTMLSelectElement}
 */
HTMLSelectElement.prototype.appendItems = function (items) {
    let self = this;
    if (Array.isArray(items)) {
        items.forEach(function (item) {
            self.add(new Option(item.text, item.val));
        });
    }
    return self;
};
Object.defineProperty(HTMLSelectElement.prototype, "appendItems", {enumerable: false,});

HTMLDivElement.prototype.initElementInterface = function () {
    let self = this;
    let htmlInterfaceMap = {
        value: {},
        text: {},
    };
    if (typeof self.value === "object") {
        for (const [k, inputElement] of Object.entries(self.value)) {
            Object.defineProperty(self, k, {
                set: function (v) {
                    inputElement.value = v;
                    htmlInterfaceMap.value[k] = inputElement;
                    return self;
                },
                get: function () {
                    return htmlInterfaceMap.value[k];
                },
            });
        }
    }
    if (typeof self.text === "object") {
        for (const [k, htmlElement] of Object.entries(self.text)) {
            Object.defineProperty(self, k, {
                set: function (v) {
                    htmlElement.textContent = v;
                    htmlInterfaceMap.text[k] = v;
                    return self;
                },
                get: function () {
                    return htmlInterfaceMap.text[k].toString();
                },
            });
        }
    }
};

/**

 var hero = {
 fit: function() {
 kl.log('普通攻击');
 }
 }

 var fit2 = function () {
 kl.log('fit2')
 }
 var hero1 = Object.create(hero);

 hero1.fit = hero1.fit.appendAfterFunction(fit2)
 hero1.fit()

 结果:
 init.js:1 普通攻击
 init.js:1 fit2


 * @param afterfn
 * @returns {function(): *}
 */
Function.prototype.appendAfterFunction = function (afterfn) {
    let _self = this;
    return function () {
        let ret = _self.apply(this, arguments);
        afterfn.apply(this, arguments);
        return ret;
    };
};


function domLoaded(fn) {
    document.addEventListener('DOMContentLoaded', function () {
        console.log('ready 1');
        fn();
    });
}

//  /data/codes/advanced/frontend/web/static/js/hammer/kl-hammer.js <--

// --> /data/codes/advanced/frontend/web/static/js/tampermonkey/footer-tool-bar-base.js
"use strict";
/*jshint esversion: 6 */
/*globals document,console,window,Emt,kl,CustomEvent,top */
/** 网页工具 基础方法库&初始化 */
if (window !== top) {
    //alert('在iframe中');
    console.warn('kl-Assembly in iframe', window, document.location.href);
    // return false;
} else {
    window.klAssembly = {
        intervalSwitch: true,
        intervalSearchSwith: true,
        blackThemeStyleState: window.localStorage.getItem('window.klAssembly.blackThemeStyleState') === 'true',
        question: {
            title: false, detail: false, tagNames: false
        },
        keyStateMap: {
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
        },
        log: function () {
        },
        warn: function (msg) {
        },
        advWarn: function (key, msg, fontSize) {
            if (key) {
                let times_n = 0;

                let style_str = '';
                if (fontSize) {
                    style_str = "style='font-size:${fontSize}em;'";
                }
                if (window.klAssembly.msgBoxDiv[key]) {
                    times_n = window.klAssembly.msgBoxDiv[key].times_n + 1;
                    window.klAssembly.msgBoxDiv[key].remove();
                }
                if (!msg) {
                    console.error('xxxx');
                    console.trace();
                }
                window.klAssembly.msgBoxDiv[key] = new Emt('span', `${style_str}`, (new Date()).toLocaleTimeString() + `/${times_n}:${msg}`);
                window.klAssembly.msgBoxDiv[key].times_n = times_n;
                console.log(   window.klAssembly.msgBoxDiv,   window.klAssembly.msgBoxDiv.firstElementChild);
                window.klAssembly.msgBoxDiv.firstElementChild.firstElementChild.append(window.klAssembly.msgBoxDiv[key]);
            } else {
                window.klAssembly.msgBoxDiv.firstElementChild.firstElementChild.append(new Emt('span', ``, (new Date()).toLocaleTimeString() + `/:${msg}`));
            }
        },
        error: function () {
        },
        alertMsg: function (msg) {
            window.alert(`alert msg 失败，方法未覆写:${msg}`);
        },
        swithToBlackTheme: function () {
            window.alert(`切换至暗黑模式失败,方法未覆写`);
        },
        exitBlackTheme: function () {
            window.alert(`退出暗黑模式失败,方法未覆写`);
        },

        toggleImgToGray: function () {
            window.alert(`图片转灰,方法未覆写`);
        },


        appendToolBaseStyleElement: function () {
            window.alert(`初始化通用工具样式失败,方法未覆写`);
        },

        initToolBase: function () {
            window.alert(`初始化通用工具事件失败,方法未覆写`);
        },
        msgWindow: {
            shutdownCount: 0,
            msgDiv: new Emt('div', 'class="msg"', 'xxx'),
            background: new Emt('div', 'class="kl_modal_background hide"'),
            showMsg: (msg, seconds) => {
                window.klAssembly.msgWindow.msgDiv.textContent = msg;
                window.klAssembly.msgWindow.shutdownCount = seconds * 10;
            }
        },
        createModalDiv: () => {
            let modalDiv = kl.HTML.DIV('class="kl_modal_background hide"');
            let modal = {
                containerDiv: new Emt('div', 'class="modal_container"'),
                titleDiv: new Emt('div', 'class="modal_title"'),
                minBtn: new Emt('button', 'type="button" class="modal_min_btn"', '➖'),
                closeBtn: new Emt('button', 'type="button" class="modal_close_btn"', '❌'),
                bodyDiv: new Emt('div', 'class="modal_body"'),
                barRevertBtn: false,
                setTitle: (title, isElement) => {
                    if (isElement) {
                        if (modal.titleDiv.firstElementChild) {
                            modal.titleDiv.firstElementChild.remove();
                        }
                        modal.titleDiv.addNode(title);
                    } else {
                        modal.titleDiv.textContent = title;
                    }
                    return modal;
                },
                addContents: (contentElements) => {
                    modal.bodyDiv.addNodes(contentElements);
                    return modal;
                },
                clearContents: () => {
                    Object.values(modal.bodyDiv.childNodes).forEach((childNode) => {
                        childNode.remove();
                    });
                },
                show: () => {
                    modalDiv.classList.remove('hide');
                },
                hide: () => {
                    modalDiv.classList.add('hide');
                },
            };
            document.body.append(
                modalDiv.addNodes([
                    modal.containerDiv.addNodes([
                        new Emt('div', 'class="modal_top"').addNodes([
                            modal.titleDiv, modal.minBtn, modal.closeBtn
                        ]),
                        modal.bodyDiv
                    ]),
                ])
            );


            modal.closeBtn.addEventListener('click', () => {
                modal.hide();
                if (modal.barRevertBtn !== false) {
                    modal.barRevertBtn.remove();
                    delete modal.barRevertBtn;
                    modal.barRevertBtn = false;
                }
            });
            modal.minBtn.addEventListener('click', () => {
                if (modal.barRevertBtn === false) {
                    modal.barRevertBtn = window.klAssembly.addOptBtn(modal.titleDiv.textContent);
                    modal.barRevertBtn.addEventListener('click', () => {
                        modal.show();
                    });
                }
                modal.hide();
            });
            modalDiv = Object.assign(modalDiv, modal);

            return modalDiv;
        },
        toolbarDiv: new Emt('div', ' class="kl_tool_bar_div" '),
        toolbarOptsDiv: new Emt('div', ' class="kl_tool_bar_opts_div hide" '),
        //toolbarOptDivsDiv: new Emt('div', ' class="kl_tool_bar_opt_divs_div" '),
        toolbarOptDivsDiv: new Emt('div', ' class="kl_tool_bar_opt_divs_container" '),
        msgBoxDiv: new Emt('div', ' class="kl-tool-msg hide" ').addNodes([
            new Emt('div', 'class="kl-tool-msgs-outer"').addNodes([
                new Emt('div', 'class="kl-tool-msgs"')
            ]),
        ]),
        toggle_Theme_Btn: false,
        toggle_Gray_Btn: false,
        deleleSelf_Btn: false,
        modal_toggleBox: false,
        hideOpts: () => {
            window.klAssembly.toolbarOptsDiv.classList.add('hide');
            window.klAssembly.msgBoxDiv.classList.add('hide');
        },
        showOpts: () => {
            window.klAssembly.toolbarOptsDiv.classList.remove('hide');
            window.klAssembly.msgBoxDiv.classList.remove('hide');

        },
        addOptBtn: (btnText) => {
            let btn = new Emt('button', 'type="button" class="kl_tool_bar_btn"', btnText);
            window.klAssembly.toolbarOptsDiv.addNodes([btn]);
            btn.setSelected = () => {
                window.klAssembly.toggle_Theme_Btn.classList.remove('kl_tool_bar_unselect_state');
            };
            btn.setNonSelected = () => {
                window.klAssembly.toggle_Theme_Btn.classList.add('kl_tool_bar_unselect_state');
            };

            return btn;
        },
        addOptDiv: () => {
            let div = new Emt('div', ' class="kl_tool_bar_opt_div"', '');
            window.klAssembly.toolbarOptDivsDiv.addNodes([div]);
            return div;
        },
        trimAttrs: (node, keepAttrNames) => {
            if (node.nodeName === '#text') {
                console.log('text', node, node.nodeName);
                return false;
            }
            if (node.tagName === 'NOSCRIPT') {
                node.remove();
                return false;
            }
            if (node.attributes === undefined) {
                console.log('node.attributes', node.attributes, node);
                return false;
            }

            let attrNames = Object.values(node.attributes || []).map((v) => {
                return v.nodeName;
            });
            console.log(node, node.tagName, attrNames, node.innerHTML);
            attrNames.forEach((attrName) => {
                if (keepAttrNames.indexOf(attrName) === -1) {
                    node.removeAttribute(attrName);
                    // console.log(`attrName: ${attrName}`, attrName, 'x');
                }
            });
            // console.log(node, node.innerHTML, 'xxxx');
        },

        trimAllNodeAttrs: (node, keepAttrNames) => {
            // console.log('>>>', node, node.innerHTML);
            let tmp_node = node.cloneNode(true);
            console.log([node, tmp_node]);
            let res = window.klAssembly.trimAttrs(tmp_node, keepAttrNames);

            Object.values(res === false ? [] : tmp_node.getElementsByTagName("*")).forEach((subNode) => {
                console.log('subNode', subNode);
                window.klAssembly.trimAttrs(subNode, keepAttrNames);
            });
            Object.values(res === false ? [] : tmp_node.getElementsByTagName("svg")).forEach((subNode) => {
                if (subNode.outerHTML === '<svg><path></path></svg>') {
                    subNode.remove();
                }
            });
            // console.log(node, node.innerHTML,'xxxx');
            //   console.log(node, node.innerHTML, '<<<');
            return tmp_node;
        },
        getSelectInnerHtml: () => {
            let selectedStr;
            let t = window.getSelection().getRangeAt(0).extractContents();
            //Object.values(t.childNodes).map(node=>{return node.innerHTML;}).join('\n');
            console.log(window.getSelection(), window.klAssembly.question);
            selectedStr = Object.values(t.childNodes).map(node => {
                // let tmp_node = node.cloneNode(true);
                //  console.log(['node', node, tmp_node]);
                return window.klAssembly.trimAllNodeAttrs(node, ['style', 'src', 'href']).innerHTML;
            }).join('\n');
            console.log(selectedStr);
            //throw 'xxxx';
            return selectedStr;
        },
        getSelectTextOnly: () => {
            let selectedStr = window.getSelection().toString();
            console.log(window.getSelection(), selectedStr, window.klAssembly.question);
            return selectedStr;
        },
        //checkbox+span 并且
        createSwithCheckboxSpan: (text, checkedFun, uncheckedFun) => {
            let checkbox = new Emt('input', 'type="checkbox" class="float_left"');
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    checkedFun();
                } else {
                    uncheckedFun();
                }
            });
            return new Emt('div', 'class="modal_body_row"').addNodes([
                new Emt('label', 'class="float_left kl_check"').addNodes([
                    checkbox,
                    new Emt('span', 'class="float_left"', text),
                ])
            ]);
        },
        createRadioList: (param) => {
            let opt = param || {};
            opt.items = opt.items || [];
            let groupDiv = new Emt('div', 'class="kl-radio-list"');

            let _handle = {
                val: false,
                checkboxs: [],
                toggleVal: () => {
                    _handle.checkboxs.forEach((checkbox) => {
                        checkbox.checked = checkbox.val === _handle.val;
                    });
                },
                setItems: (items) => {
                    groupDiv.removeAllChildNodes();
                    _handle.checkboxs = [];
                    items.forEach((item) => {
                        let chekcbox = new Emt('input', 'type="checkbox" class=""', '', {val: item.val});
                        _handle.checkboxs.push(chekcbox);
                        groupDiv.addNodes([
                            new Emt('label', 'class="').addNodes([
                                chekcbox,
                                new Emt('span', '', item.text),
                            ])
                        ]);
                        chekcbox.addEventListener('change', (e) => {
                            e.stopPropagation();//
                            groupDiv.value = chekcbox.val;
                            groupDiv.dispatchEvent(new Event('change'));
                            // e.stopPropagation();
                            // e.preventDefault();
                        });
                    });
                },
            };


            Object.defineProperty(_handle, 'items', {
                set: function (v) {
                    _handle.setItems(v);
                    return groupDiv;
                },
                get: function () {
                    return _handle.items;
                },
            });

            Object.defineProperty(groupDiv, 'value', {
                set: function (v) {
                    _handle.val = v;
                    _handle.toggleVal();
                    return groupDiv;
                },
                get: function () {
                    return _handle.val;
                },
            });
            groupDiv = Object.assign(groupDiv, _handle);
            if (Array.isArray(opt.items)) {
                groupDiv.setItems(opt.items);
            }
            if (opt.value !== undefined) {
                groupDiv.value = opt.value;
            }
            return groupDiv;
        },
    };
    if (window.localStorage.getItem('kl_debug') === 'true') {
        window.klAssembly.log = console.log;
        window.klAssembly.warn = console.warn;
        window.klAssembly.error = console.error;
    }

    window.klAssembly.toggle_Theme_Btn = window.klAssembly.addOptBtn('暗黑');
    window.klAssembly.toggle_Gray_Btn = window.klAssembly.addOptBtn('灰图');
    window.klAssembly.deleleSelf_Btn = window.klAssembly.addOptBtn('X');


//window.klAssembly.modal_toggleBox = window.klAssembly.addOptDiv();

    window.setInterval(() => {
        if (window.klAssembly.msgWindow.shutdownCount > 0) {
            window.klAssembly.msgWindow.shutdownCount = window.klAssembly.msgWindow.shutdownCount - 1;
            if (window.klAssembly.msgWindow.shutdownCount === 0) {
                window.klAssembly.msgWindow.background.classList.add('hide');
            } else {
                window.klAssembly.msgWindow.background.classList.remove('hide');
            }
        }
    }, 100);
    document.body.append(window.klAssembly.msgWindow.background.addNodes([window.klAssembly.msgWindow.msgDiv]));

    window.klAssembly.showMsg = function (msg) {
        kl.log(msg);
        window.klAssembly.msgWindow.showMsg(msg, 0.5);
    };
    window.klAssembly.alertMsg = function (msg) {
        kl.log(msg);
        window.klAssembly.msgWindow.showMsg(msg, 0.5);
    };


    let isInBlackTheme = () => {
        return document.body.className.indexOf('kl_black_theme_style') !== -1;
    };

    window.klAssembly.swithToBlackTheme = (flag) => {
        console.log(`swithToBlackTheme ${flag}`);
        window.klAssembly.toggle_Theme_Btn.setSelected();
        document.body.classList.add('kl_black_theme_style');
        if (window.klAssembly.keyStateMap.ctrlKey === false) {
            window.localStorage.setItem('window.klAssembly.blackThemeStyleState', 'true');
        }
        window.klAssembly.blackThemeStyleState = true;
    };


    window.klAssembly.exitBlackTheme = (flag) => {
        console.log(`exitBlackTheme ${flag}`);
        window.klAssembly.toggle_Theme_Btn.setNonSelected();
        document.body.classList.remove('kl_black_theme_style');
        if (window.klAssembly.keyStateMap.ctrlKey === false) {
            window.localStorage.setItem('window.klAssembly.blackThemeStyleState', 'false');
        }
        window.klAssembly.blackThemeStyleState = false;

    };
    window.klAssembly.toggleImgToGray = () => {
        document.body.classList.toggle('kl_gray_img');
    };


    window.klAssembly.appendToolBaseStyleElement = () => {
        let classStr = document.body.getAttribute('class');
        document.body.setAttribute('class', `${classStr} kl_black_theme_style`);
        console.log(document.body.getAttribute('class'));
        if (kl.id('kl_tool_base_style_element') === null) {
            let s = new Emt('style', 'id="kl_tool_base_style_element"', '');
            s.innerHTML = `
    .kl_tool_bar_div {
      all: initial;
      * {
        all: unset;
      }
    }
    .kl_modal_background {
     all: revert;      
    }
     .kl_modal_background * {
        all: revert;
     }
    @media only screen  and (max-width: 1000px) {
        .kl_tool_bar_div {
            top: calc(100vh - 8em - 5px) !important;
        }
        
       
    }
    .kl_black_theme_style *{   
        background-color: rgba(43,43,43,1) !important;
        color:rgb(135,135,135) !important;
    }

   
    .kl_black_theme_style img,.kl_black_theme_style video,.kl_black_theme_style iframe{
       opacity: 0.26;
       filter:grayscale(100%) invert(100%);
     }
     .kl_black_theme_style.kl_gray_img img,.kl_black_theme_style.kl_gray_img video,.kl_black_theme_style.kl_gray_img iframe{
       opacity: 0.5;
       filter:grayscale(100%);
     }
    .kl_black_theme_style img:hover,.kl_black_theme_style video:hover,.kl_black_theme_style iframe:hover{
       opacity: 1;
       filter:grayscale(0%) invert(0%);
    }
  
    .hide {
        display:none !important;
    }
    .float_left{
        display:block;
        float:left;
    }
    .kl_tool_bar_div {    
        position: fixed;
        top:  calc(100vh - 3em - 5px);
        left: 0;
        margin-left: 15px;
        color1: #FFF;
        padding:0.5em;
        background: #FFF !important;
        z-index: 9999999;
        font-weight: 900; 
    }
    .kl_tool_bar_div>* {    
       display:block  ;
       float:left ;
    }
   
    .kl_tool_bar_opts_div {    }
    .kl_tool_bar_opts_div>* {   float:left; }
    .kl_tool_bar_btn {    
        //display:block;    
        //float:left;    
        background:#DDD;    
        margin-left: 15px;
        z-index: 9999999;
    }
    .kl_tool_opts_div_btn{
        font-size1:3em;
        border:1px solid #999;
        margin-top1:-1em;
        margin-left:1em;
        background:#DDD;    
        margin-left: 15px;
        z-index: 9999999;
    }
    .kl_tool_bar_opt_divs_container{
        position: fixed;
        top: calc(100vh - 20em);
        left: 2em;
        height: auto;
        width: 20em;
        min-height: 1em;
    }
    .kl-tool-msg{
    
        position: fixed;
    top: calc(100vh - 5em - 5px);
    left: 0;
    margin-left: 15px;
    padding: 0.5em;
    background: #FFF !important;
    z-index: 9999999;
    font-weight: 900;
    
            left: 2em;
            height: 1em;
            width: 20em;
            min-height: 1em;        
    }
    .kl-tool-msgs-outer{
            display:block;
            float:left;       
            width:100%;   
            height:auto;
            position: relative;
    }
    .kl-tool-msgs,.kl-tool-msgs>*{          
            display:block;
            float:left;       
            width:100%;         
    }
    .kl-tool-msgs{
            transform: translateY(-100%);       
    }
    .kl-tool-msgs>*{
            text-shadow: 2px 0 #FFF,
            -2px 0 #FFF,
            0 2px #FFF,
            0 -2px #FFF,
            2px 2px #FFF,
            -2px -2px #FFF,
            2px -2px #FFF,
            -2px 2px #FFF;               
    }
    .kl_tool_bar_opt_divs_div{
        width:100%;
    }
    
    .kl_tool_bar_opt_div{        
        background:#DDD;      
    }
    .kl_tool_bar_unselect_state {    
        text-decoration-line: line-through;
        text-decoration-color: #F00;
        /* text-decoration-style: double; */
        text-decoration-thickness: 20%;
    }
    .kl_modal_background {
        width:100%;
        height:100%;
        position:fixed;
        left:0;
        top:0;
        z-index:999999;
        background:#fefefe;
    }
    .kl_modal_background>.msg {
        top:50%;
        transform: translate(0, -50%);
        position: relative;
        width:100%;
        text-align:center;
    }
    .kl_modal_background>.modal_container{
        position: relative;
        width: 80%;
        margin: 0 auto;
        margin-top: 2em;        
        height: calc(100vh - 7em );
        overflow-y: scroll;
        overflow-x:hidden;
    }
    .kl_modal_background .modal_top{
        display: flex;
        border-bottom: 1px solid #000;
        font-size: 1.5em;
        padding-bottom: 1em;
    }
    .kl_modal_background .modal_top > button{
        padding-left: 0.5em;
        padding-right: 0.5em;
        margin-left: 1em;
    }
    .modal_close_btn{
        background:#000;
    }
     .modal_close_btn{
    }
    
    
    .kl_modal_background .modal_title{
        flex-grow: 1;
    }
     .kl_modal_background .modal_body{
        width:100%;
        border:1px solid #000;
    }
    .modal_body .css_revert,.css_revert *{
        all:revert !important;
    }
    .modal_body_row {
        width:calc(100% - 2px - 1em);
        height:2em;
        line-height:1em;
        font-size:2em;
        border:1px solid #000;
        padding:0.5em;
    } 
    .kl_check>*:checked + * {
        color: #FFF;
        background-color: #000;
    }
    .modal_body_row .kl_check>*{
        
    }
    .modal_body_row .kl_check>input[type="checkbox"]{
        height:2em;
        width:2em;
    }
    .modal_body_row_text_input{
        width:100%;
        resize: vertical;
        min-height:2em;
    } 
    .modal_body>div{
        width:100%;
        float:left;
    }
    .kl-radio-list , .kl-radio-list>*,.kl-checkbox-list , .kl-checkbox-list>*{
        display:block;
        float:left;
    }
    .kl-radio-list>label,  .kl-checkbox-list>label{
        display:block;
        float:left;
        padding:0.5em;
    }
    .kl-radio-list>label>input[type="checkbox"],  .kl-checkbox-list>label>input[type="checkbox"]{
        display:none;
    }
    .kl-radio-list input+span,  .kl-checkbox-list input+span{
        background: #FFF !important;
        color: #000 !important;
    }
     .kl-radio-list input:checked+span, .kl-checkbox-list input:checked+span{
        background: #000 !important;
        font-weight: 900;
        color: #FFF !important;
    }
    `;
            document.body.append(s);
            console.log('----> 添加style element');
            if (window.klAssembly.blackThemeStyleState) {

            } else {
                window.klAssembly.exitBlackTheme('append css');
            }
        }
    };

    window.klAssembly.initToolBase = function () {
        if (window.klAssembly.isNeedBaseLib === false) {
            return false;
        }
        console.log('初始化 工具 通用事件 ');
        console.log(document.body.getAttribute('class'));

        //️↔️
        let toggle_OptsDiv_Btn = new Emt('button', 'type="button" class="kl_tool_opts_div_btn"', `⚙️`);

        //  console.log(window.localStorage.getItem('window.klAssembly.blackThemeStyleState') !== 'false');


        document.body.append(window.klAssembly.msgBoxDiv,
            window.klAssembly.toolbarDiv.addNodes([
                toggle_OptsDiv_Btn,
                window.klAssembly.toolbarOptsDiv.addNodes([
                    // new Emt('div', ' class="kl_tool_bar_opt_divs_container" ').addNodes([
                    window.klAssembly.toolbarOptDivsDiv,
                    //  ]),
                    window.klAssembly.toggle_Theme_Btn,
                    window.klAssembly.toggle_Gray_Btn,
                ])
            ]));
        toggle_OptsDiv_Btn.addEventListener('click', () => {
            window.klAssembly.toolbarOptsDiv.classList.toggle('hide');
            window.klAssembly.msgBoxDiv.classList.toggle('hide');

        });

        window.klAssembly.toggle_Theme_Btn.addEventListener('click', function () {
            window.klAssembly.blackThemeStyleState = !window.klAssembly.blackThemeStyleState;
            if (window.klAssembly.blackThemeStyleState) {
                window.klAssembly.swithToBlackTheme('click');
            } else {
                window.klAssembly.exitBlackTheme('click');
            }
        });
        window.klAssembly.toggle_Gray_Btn.addEventListener('click', function () {
            window.klAssembly.toggleImgToGray();
        });

        window.klAssembly.deleleSelf_Btn.addEventListener('click', () => {
            window.klAssembly.toolbarDiv.remove();
            window.klAssembly.msgBoxDiv.remove();

        });

        console.log(document.body.getAttribute('class'));
        /*
        document.body.addEventListener("DOMSubtreeModified", function (event) {
            // console.log('DOMSubtreeModified', event.target);// event.target就是依次插入的DOM节点
            // call_i++;
            //window.klZhihu.domChangedTimesDiv.textContent = call_i.toString();

            if (window.klAssembly.blackThemeStyleState === true && document.body.className.indexOf('kl_black_theme_style') === -1) {
                window.klAssembly.swithToBlackTheme('DOMSubtreeModified');
                Object.values(kl.xpathSearch(".//button[contains(@class,'Modal-closeButton')]")).forEach(btn => {
                    btn.click();
                });
            }

            if (window.klAssembly.blackThemeStyleState === false && document.body.className.indexOf('kl_black_theme_style') !== -1) {
                window.klAssembly.exitBlackTheme('DOMSubtreeModified');
            }


        }, false);
           */

        // Firefox和Chrome早期版本中带有前缀
        let MutationObserver = window.MutationObserver;
// 创建观察者对象
        let klObserver = new MutationObserver(function (mutations) {
            if (window.klAssembly.blackThemeStyleState === true && document.body.className.indexOf('kl_black_theme_style') === -1) {
                window.klAssembly.swithToBlackTheme('DOMSubtreeModified');
                Object.values(kl.xpathSearch(".//button[contains(@class,'Modal-closeButton')]")).forEach(btn => {
                    btn.click();
                });
            }

            if (window.klAssembly.blackThemeStyleState === false && document.body.className.indexOf('kl_black_theme_style') !== -1) {
                window.klAssembly.exitBlackTheme('DOMSubtreeModified');
            }
        });

        klObserver.observe(document.body, {
            //attributes: true,
            childList: true,
            //   characterData: true,
            subtree: true
        });

        document.body.addEventListener('keydown', function (e) {
            let keyCode = e.key || e.which || e.charCode;
            let ctrlKey = e.ctrlKey;
            let altKey = e.altKey;
            let shiftKey = e.shiftKey;
            console.log('key down:' + (ctrlKey ? 'yes' : 'no') + ' alt:' + (altKey ? 'yes' : 'no') + ' shift:' + (shiftKey ? 'yes' : 'no') + '【' + keyCode + '】');

            window.klAssembly.keyStateMap = {
                ctrlKey: e.ctrlKey,
                altKey: e.altKey,
                shiftKey: e.shiftKey,
            };
            if ((ctrlKey && shiftKey && keyCode === 'C') || (ctrlKey && keyCode === 'b')) {
                //alert("组合键成功")
                console.log('切换');
                window.klAssembly.toggle_Theme_Btn.dispatchEvent(new CustomEvent('click'));
                e.preventDefault();
                return false;
            }
        });

        document.body.addEventListener('keypress', function (e) {
            let keyCode = e.key || e.which || e.charCode;
            let ctrlKey = e.ctrlKey;
            let altKey = e.altKey;
            let shiftKey = e.shiftKey;
            // console.log('key press:' + (ctrlKey ? 'yes' : 'no') + ' alt:' + (altKey ? 'yes' : 'no') + ' shift:' + (shiftKey ? 'yes' : 'no') + '【' + keyCode + '】');

        });
        document.body.addEventListener('keyup', function (e) {
            let keyCode = e.key || e.which || e.charCode;
            let ctrlKey = e.ctrlKey;
            let altKey = e.altKey;
            let shiftKey = e.shiftKey;
            console.log('key up:' + (ctrlKey ? 'yes' : 'no') + ' alt:' + (altKey ? 'yes' : 'no') + ' shift:' + (shiftKey ? 'yes' : 'no') + '【' + keyCode + '】');
            window.klAssembly.keyStateMap = {
                ctrlKey: e.ctrlKey,
                altKey: e.altKey,
                shiftKey: e.shiftKey,
            };
        });


    };
    window.klAssembly.appendToolBaseStyleElement();
    window.setTimeout(function () {
        window.klAssembly.initToolBase();
    }, 200);


}







//  /data/codes/advanced/frontend/web/static/js/tampermonkey/footer-tool-bar-base.js <--

// --> /data/codes/advanced/frontend/web/static/js/var/collection_tags.js

window.collection_tags = ["\u559c       \u6709\u542f\u53d1\/\u6da8\u89c1\u8bc6",{"value":"\u6709\u542f\u53d1","letterCn":"You_QiFa","letterEn":[""]},{"value":"\u6da8\u89c1\u8bc6","letterCn":"Zhang_JianShi","letterEn":[""]},{"value":"\u53cd\u76f4\u89c9","letterCn":"FanZhiJue","letterEn":[""]},{"value":"\u918d\u9190\u704c\u9876","letterCn":"TiHuGuanDing","letterEn":[""]},{"value":"\u53e6\u6709\u660e\u609f","letterCn":"LingYou_MingWu","letterEn":[""]},{"value":"\u8a00\u8f9e\u7280\u5229","letterCn":"YanCi_XiLi","letterEn":[""]},{"value":"\u4e00\u53e5\u603c\u6b7b","letterCn":"Yi_Ju_Dui_Si","letterEn":[""]},{"value":"\u6587\u7b14\u4f18\u7f8e","letterCn":"WenBi_YouMei","letterEn":[""]},{"value":"\u89d2\u5ea6\u5201\u94bb","letterCn":"JiaoDu_DiaoZuan","letterEn":[""]},{"value":"\u503c\u5f97\u6df1\u601d","letterCn":"ZhiDe_ShenSi","letterEn":[""]},{"value":"\u793e\u4f1a\u89c2\u5bdf","letterCn":"SheHui_GuanCha","letterEn":[""]},{"value":"\u603b\u7ed3\u7cbe\u8f9f","letterCn":"ZongJie_JingPi","letterEn":[""]},{"value":"\u8fd8\u80fd\u8fd9\u4e48\u73a9?","letterCn":"HaiNengZheMeWan","letterEn":[""]},{"value":"\u603c\u7684\u597d","letterCn":"DuiDeHao","letterEn":[""]},"\u559c          \u6210\u957f\/\u8d44\u6599\u7c7b",{"value":"\u6709\u6536\u85cf\u4ef7\u503c","letterCn":"You_ShouCang_JiaZhi","letterEn":[""]},{"value":"\u59cb\u4e8e\u8db3\u4e0b","letterCn":"ShiYuZuXia","letterEn":[""]},{"value":"\u4ed6\u5c71\u4e4b\u77f3","letterCn":"TaShanZhiShi","letterEn":[""]},{"value":"\u53ef\u4ee5\u653b\u7389","letterCn":"KeYiGongYu","letterEn":[""]},{"value":"\u4ee5\u524d\u4e0d\u5c51\u4e00\u987e\u2014\u2014\u73b0\u5728\u75af\u72c2\u7b14\u8bb0","letterCn":"QiQian_BuGuYiXie_XianZai_FengKuangBiJi","letterEn":["now"]},{"value":"\u8dd1\u9898\u2014\u2014\u4f46\u6709\u7528","letterCn":"PaoTi_DanYouYong","letterEn":["but"]},{"value":"\u89c2\u70b9\u504f\u9887\u2014\u2014\u8d44\u6599\u6709\u4ef7\u503c","letterCn":"GuanDian_PianPo_ZiLiao_YouJiaZhi","letterEn":["but"]},{"value":"\u89c2\u70b9\u5783\u573e\u2014\u2014\u8d44\u6599\u6709\u4ef7\u503c","letterCn":"GuanDian_LaJi_ZiLiao_YouJiaZhi","letterEn":["but"]},{"value":"\u5fc3\u6709\u621a\u621a\u7109","letterCn":"Xin_You_QiQiYan","letterEn":["me","too"]},"\u6012",{"value":"\u6c11\u751f\u591a\u8270","letterCn":"","letterEn":[""]},{"value":"\u65e0\u803b\u884c\u5f84","letterCn":"","letterEn":[""]},{"value":"\u72d7\u4e1c\u897f\u540d\u5355","letterCn":"Gou_DongXi_MingDan","letterEn":["dog","list"]},"\u54c0        \u6c89\u91cd",{"value":"\u53cd\u601d\u81ea\u7701","letterCn":"FanSi_FanXing","letterEn":[""]},{"value":"\u8840\u6dcb\u6dcb\u4e8b\u5b9e","letterCn":"XueLinLin_ShiShi","letterEn":[""]},{"value":"\u8840\u6dcb\u6dcb\u4ee3\u4ef7","letterCn":"XueLinLin_DaiJia","letterEn":[""]},{"value":"\u4e8b\u5b9e\u4e0d\u8bb2\u903b\u8f91","letterCn":"ShiShi_Bu_Jiang_LuoJi","letterEn":[""]},{"value":"\u65f6\u4ee3\u4e0d\u540c\u4e86","letterCn":"ShiDai_Bu_Tong_le","letterEn":[""]},{"value":"\u5927\u5bb6\u90fd\u4e00\u6837(\u4e2d\u5916)","letterCn":"DaJia_DouYiYang_ZhongWai","letterEn":["Same"]},{"value":"\u5927\u5bb6\u90fd\u4e00\u6837(\u53e4\u4eca)","letterCn":"DaJia_DouYiYang_GuJin","letterEn":["Same"]},{"value":"\u5927\u5bb6\u90fd\u4e00\u6837(\u4e2a\u4eba)","letterCn":"DaJia_DouYiYang_GeRen","letterEn":["Same"]},{"value":"\u987b\u5f97\u53cd\u601d","letterCn":"ZhiDe_FanSi","letterEn":["Think"]},{"value":"\u53cd\u5e38\uff0c\u5f80\u574f\u5904\u60f3","letterCn":"FanChang_HuaiChu_Xiang","letterEn":["Think"]},{"value":"\u843d\u4e0b\u795e\u575b","letterCn":"LuoXiaShenTan","letterEn":[true]},{"value":"\u624e\u5fc3\u4e86","letterCn":"ZhaXinLe","letterEn":["heart","hit"]},{"value":"\u6df1\u6709\u540c\u611f","letterCn":"Shen_You_Tong_Gan","letterEn":[""]},{"value":"\u6c11\u751f\u591a\u8270","letterCn":"","letterEn":[""]},{"value":"\u4eba\u751f\u767e\u5473","letterCn":"RenSheng_BaiWei","letterEn":[""]},{"value":"\u5fe0\u4e8e\u7406\u60f3","letterCn":"MianDui_LiXiang","letterEn":[""]},{"value":"\u9762\u5bf9\u73b0\u5b9e","letterCn":"ZhongYu_XianShi","letterEn":[""]},{"value":"\u6de1\u6de1\u7684\u60b2\u4f24","letterCn":"DanDan_De_BeiShang","letterEn":["sad"]},{"value":"\u6328\u4e86\u56de\u65cb\u9556","letterCn":"HuiXuanBiao","letterEn":[""]},{"value":"\u5e74\u8f7b\u65f6\u5c04\u51fa\u7684\u5b50\u5f39","letterCn":"NianQing_Shi_SheChu_ZiDan","letterEn":[""]},"\u4e50         \u592a\u5c11\u89c1\u4e86",{"value":"\u5e38\u4eba\u4e0d\u80fd","letterCn":"ChangRen_BuNeng","letterEn":[""]},{"value":"\u6709\u610f\u601d","letterCn":"YouYiSi","letterEn":["fun"]},{"value":"\u592a\u597d\u7b11\u4e86","letterCn":"HaoXiao","letterEn":["fun"]},{"value":"\u597d\u624b\u6bb5","letterCn":"HaoShouDuan","letterEn":["goodJob","goodWay"]},{"value":"\u6d3b\u4e45\u89c1","letterCn":"Huo_Jiu_Jian","letterEn":[""]},{"value":"\u4e0d\u80fd\u76f4\u89c6","letterCn":"BuNeng_ZhiShi","letterEn":[""]},{"value":"\u8c23\u8a00\u5bfb\u6839","letterCn":"YaoYan_XunGen","letterEn":[""]},{"value":"\u7ec6\u601d\u6781\u6050","letterCn":"XiSiJiKong","letterEn":[""]},{"value":"\u9ed1\u8272\u5e7d\u9ed8","letterCn":"HeiSeYouMo","letterEn":["black"]},{"value":"\u5927\u8dcc\u773c\u955c","letterCn":"DaDieYanJing","letterEn":[""]},{"value":"\u4e0d\u80fd\u5ffd\u89c6","letterCn":"BuNeng_HuShi","letterEn":["must"]},{"value":"\u610f\u60f3\u4e0d\u5230","letterCn":"YiXiangBuDao","letterEn":[""]},{"value":"\u795e\u4e4e\u5176\u795e","letterCn":"ShenHuQiShen","letterEn":["wonder","amazing"]},{"value":"\u521b\u610f\u5341\u8db3","letterCn":"ChuangYiShiZu","letterEn":["wonder","amazing"]},{"value":"\u5947\u4eba\u5947\u4e8b","letterCn":"QiRenQiShi","letterEn":["wonder","amazing"]},{"value":"\u95f9\u5267","letterCn":"NaoJu","letterEn":["farce","funny"]},{"value":"\u5408\u8ba2\u672c","letterCn":"HeDingBen","letterEn":[""]},{"value":"\u8fd8\u80fd\u8fd9\u4e48\u73a9?","letterCn":"HaiNengZheMeWan","letterEn":[""]},{"value":"\u56de\u65cb\u9556","letterCn":"HuiXuanBiao","letterEn":[""]},"\u8d2a\u55d4\u75f4\u6162           \u4e0d\u53ef\u4ee5\u5df1\u5ea6\u4eba",{"value":"\u6d6a\u8d39\u8d44\u6599\u4e86","letterCn":"LangFei_ZiLiao","letterEn":[""]},{"value":"\u9e21\u9e23\u72d7\u5420","letterCn":"JiMingGouFei","letterEn":["joker"]},{"value":"\u667a\u969c","letterCn":"ZhiZhang__Joker","letterEn":["joker"]},{"value":"\u53cc\u6807\u72d7","letterCn":"ShuangBiaoGou","letterEn":["dog","joker"]},{"value":"\u62f7\u6253\u667a\u969c","letterCn":"KaoDa_ZhiZhang","letterEn":[""]},{"value":"\u6c11\u751f\u591a\u8270","letterCn":"","letterEn":[""]},"\u60ca\u8bb6",{"value":"\u96be\u4ee5\u7f6e\u4fe1","letterCn":"NanYiZhiXin","letterEn":["unbelievable","incredible"]},"\u609f",{"value":"\u4eba\u751f\u611f\u609f","letterCn":"RenShengGanWu","letterEn":[""]},{"value":"\u751f\u6d3b\u4f53\u609f","letterCn":"ShengHuo_TiWu","letterEn":[""]},"\u53d1\u6563\u601d\u7ef4",{"value":"\u8111\u6d1e\u5927\u5f00","letterCn":"HuanXiang_NaoDong","letterEn":[""]},"\u603b\u7ed3",{"value":"\u603b\u7ed3\u7cbe\u8f9f","letterCn":"ZongJie_JingPi","letterEn":[""]},{"value":"\u6570\u5b57\u8bf4\u8bdd","letterCn":"ShuZi_Shuahua","letterEn":[""]},{"value":"\u771f\u77e5\u707c\u89c1","letterCn":"ZhenZhiZhuoJian","letterEn":[""]},{"value":"\u7b49\u5f85\u540e\u7eed","letterCn":"DengDai_HouXu","letterEn":["Wait Continue"]},{"value":"\u5927\u4f17\u90fd\u662f\u7334\u5b50","letterCn":"DaZhong_doushi_HouZi","letterEn":["monkey","people"]},{"value":"\u8349\u53f0\u73ed\u5b50","letterCn":"CaoTaiBanZi","letterEn":[""]},{"value":"\u793e\u4f1a\u5236\u5ea6\u6709\u95ee\u9898","letterCn":"SheHui_ZhiDu_YouWenTi_GongZheng_GonegPing","letterEn":[""]},"\u7f16\u8f91",{"value":"\u91d1\u53e5\u6458\u6284","letterCn":"JinJu","letterEn":[""]},"\u53f9",{"value":"\u95ea\u5149\u70b9","letterCn":"ShanGuangDian","letterEn":[""]},{"value":"\u8fd8\u662f\u6709\u771f\u5584\u7f8e\u7684","letterCn":"HaiShiYou_ZhenShanMei","letterEn":[""]}];

//  /data/codes/advanced/frontend/web/static/js/var/collection_tags.js <--

// --> /data/codes/advanced/frontend/web/static/js/tampermonkey/bilibili/index.css

if (kl.id('www__bilibili__com_css') === null) {
    let s = new Emt('style', 'id="www__bilibili__com_css"', '');
    s.innerHTML=`@media only screen  and (max-width: 1000px) {

}

* {
    color: #666 !important;
}

a {

}

.bili-video-card__info--tit {
    height: auto !important;
}

.bili-video-card__info--tit a {
    font-size: 1.5em;
}

.kl-in-com {
    img, video {
        opacity: 0.01;
    }
}

div {
}

.kl-body {
    .feed-card {

    }

    .bili-dyn-item__header {
        .bili-dyn-content__orig, .bili-dyn-content__orig__topic {
            display: none !important;
        }

    }

    .bili-dyn-content__orig {
        .bili-dyn-content__orig__topic {
            display: none !important;
        }
    }

    .bili-dyn-interaction {
        .bili-dyn-interaction__item {
            display: none !important;
        }
    }

}

.kl-body .unavailable-ele {
    display: none !important;
}


.kl-tv {
    width: calc(100vw);
    height: calc(100vh);
    position: fixed;
    top: 0;
    left: 0;
}

.kl-b-tv {
}

.kl-tv-desktop {
    width: 100%;
    height: 100%;
    flex-direction: row;
    display: flex;
}

.kl-tv-ele {
}

.kl-flag-ele {
    padding: 1em !important;
}

.kl-hover {
    -box-sizing: border-box;
    background: #000 !important;
    color: #FFF !important;
    -border: solid 1em #FF0;
}

.kl-b-tv-index {
}

.kl-desk-menus-container, .kl-desk-windows-container {
    border: 1px solid #000;
    height: calc(50vh);
}

.kl-desk-menus-container {
    width: 10em;
    background: #F00;
}

.kl-desk-windows-container {
    flex: 1;
    background: #0F0;
}

.kl-desk-menus-containerd > div, .kl-desk-windows-container > div {

}

.kl-desk-menus-container > div {

}

.kl-desk-windows-container > div {

}

.hide {
    display: none;
}

.kl-player-iframe {

}

.kl-desk-modal {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999999;
    height: calc(100vh);
    border: 1px solid #000;
    min-width: 1em;
    display: flex;
    background: #FFF;
}

.kl-desk-modal > div {
    float: left;
    height: 100%;
    min-width: 8em;
    -padding: 1em;
    border: 1px solid #000;

}

.kl-setting-area {
    width: 30em;

    a {
        font-size: 2em;
    }
}

.kl-channels-area {
    a {
        font-size: 2em;
    }

}

.color-bg-1 {
    background: linear-gradient(217deg, rgba(255, 0, 0, 0.8), rgba(255, 0, 0, 0) 70.71%),
    linear-gradient(127deg, rgba(0, 255, 0, 0.8), rgba(0, 255, 0, 0) 70.71%),
    linear-gradient(336deg, rgba(0, 0, 255, 0.8), rgba(0, 0, 255, 0) 70.71%);
    animation: gradientShift 15s ease infinite;
    background-size: 200% 200%;
}

.color-bg-2 {
    background: repeating-linear-gradient(
            190deg,
            rgba(255, 0, 0, 0.5) 40px,
            rgba(255, 153, 0, 0.5) 80px,
            rgba(255, 255, 0, 0.5) 120px,
            rgba(0, 255, 0, 0.5) 160px,
            rgba(0, 0, 255, 0.5) 200px,
            rgba(75, 0, 130, 0.5) 240px,
            rgba(238, 130, 238, 0.5) 280px,
            rgba(255, 0, 0, 0.5) 300px
    ),
    repeating-linear-gradient(
            -190deg,
            rgba(255, 0, 0, 0.5) 30px,
            rgba(255, 153, 0, 0.5) 60px,
            rgba(255, 255, 0, 0.5) 90px,
            rgba(0, 255, 0, 0.5) 120px,
            rgba(0, 0, 255, 0.5) 150px,
            rgba(75, 0, 130, 0.5) 180px,
            rgba(238, 130, 238, 0.5) 210px,
            rgba(255, 0, 0, 0.5) 230px
    ),
    repeating-linear-gradient(
            23deg,
            red 50px,
            orange 100px,
            yellow 150px,
            green 200px,
            blue 250px,
            indigo 300px,
            violet 350px,
            red 370px
    );
}

@keyframes gradientShift {
    0% {
        background-position: 0% 0%;
    }
    25% {
        background-position: 100% 0%;
    }
    50% {
        background-position: 100% 100%;
    }
    75% {
        background-position: 0% 100%;
    }
    100% {
        background-position: 0% 0%;
    }
}

.kl-setting-area > div {
    width: 100%;
    min-height: 2em;
    float: left;
    border: 1px solid #000 !important;
    padding: 0px !important;
}

.kl-channels-area > div {
    width: 15em;
    height: 4em;
    float: left;
    border: 1px solid #000 !important;
    padding: 0px !important;
}

.kl-channels-area > div > div {

}

.kl-setting-area > div > div, .kl-channels-area > div > div {
    color: #FFF !important;
    text-stroke: 1px #000;
    text-shadow: 1px 1px 1em #000;
}

.kl-setting-area > div > span, .kl-channels-area > div > span {
    display: none;
}

.kl-msgs-box {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 20em;
    background: #DDD;
    z-index: 99999;
    max-height: calc(50vh);
    opacity: 0.5;
}

.fade-out {
    opacity: 1;
    animation: fadeOut 60s forwards;
}

@keyframes fadeOut {
    0% {
        opacity: 1;
        visibility: visible;
    }
    80% {
        opacity: 1; /* 前80%时间保持显示 */
    }
    100% {
        opacity: 0;
        visibility: hidden;
    }
}

#bilibili-player .kl-test {
    display: none !important;
}

#bilibili-player .kl-flag-ele {
}

#bilibili-player .kl-hover {
}

.kl-no-debug .kl-test {
    display: none !important;
}

.kl-history .unavailable-ele {
    display: none !important;
}

.kl-history .bili-dyn-list__items {
    float: left;
    z-index: 999999;
}


.kl-history {
    .bili-dyn-list__item {
        width: 18%;
        float: left;
        padding: 1% !important;

        .bili-dyn-item {
            min-width: auto;
        }

        .bili-dyn-item__main {
            padding: unset;
        }

        .fs-medium {
            font-size: 20px !important;
        }
    }

    .bili-dyn-item__footer, .bili-dyn-item__avatar, .bili-dyn-item__more, .bili-dyn-content__orig__desc {
        display: none !important;
    }

    .bili-dyn-card-video {
        display: block !important;
        float: left;
        height: auto;

        .bili-dyn-card-video__body {
            display: block !important;
            width: 100% !important;

            .fs-small {
                display: none;
            }

            .bili-dyn-interaction__item {
                display: none;
            }
        }

        .bili-dyn-card-video__header {
            width: 100% !important;
        }
    }
}

.kl-video-page {
    .kl-video-opt {
        position: fixed;
        top: 0;
        left: 0;
        width: auto;
        height: calc(100vh);
        min-width: 20em;
        z-index: 999999;
    }

    .kl-video-eplist {
        position: fixed;
        top: 0;
        left: 0;
        width: auto;
        height: calc(100vh);
        min-width: 20em;
        z-index: 999999;
        float: left;
    }

    .kl-video-rcmd-list {
        left: 0px;
        top: 0px;
        position: fixed;
        background: #FFF;
        width: 100%;
        z-index: 99999;

        .video-page-card-small {
            width: 22%;
            float: left;
        }
    }
}`;
    document.body.append(s);
}

//  /data/codes/advanced/frontend/web/static/js/tampermonkey/bilibili/index.css <--

// --> /data/codes/advanced/frontend/web/static/js/tampermonkey/bilibili/index.js
"use strict";
/*jshint esversion: 6 */
/*globals document,console,window,Emt,kl,CustomEvent */

"use strict";
let klBBLL = {
    intervalSwitch: true,
    IS_DEBUG: false,
    IS_IN_COM: false,
    PAGE_FLAG: false,
    CURR_AREA: false,
    CURR_ELE: false,
    VIDEO_PLAYER_CTRL_BAR: false,
    _log: console.log,
    _warn: console.warn,
    _error: console.error,
    log: () => {
    },
    warn: console.warn,
    error: console.error,
    debug: (isDebug) => {
        if (isDebug === undefined) {
            klBBLL.IS_DEBUG = !klBBLL.IS_DEBUG;
        } else {
            klBBLL.IS_DEBUG = !!isDebug;
        }
        if (klBBLL.IS_DEBUG) {
            window.localStorage.setItem('isKlTvDebug', 'true');
            document.body.classList.remove('kl-no-debug');
            klBBLL.log = klBBLL._log;
            //   klBBLL.warn = klBBLL._warn;
            //    klBBLL.error = klBBLL._error;
        } else {
            window.localStorage.setItem('isKlTvDebug', 'false');
            document.body.classList.add('kl-no-debug');
            let fn = () => {
            };
            klBBLL.log = fn;
            // klBBLL.warn = fn;
            // klBBLL.error = fn;
        }
        console.warn(`切换 klBBLL.debug [${klBBLL.IS_DEBUG}]`);

    },
    setInCom: (isInCom) => {
        klBBLL.IS_IN_COM = !!isInCom;
        window.localStorage.setItem('isKlInCom', klBBLL.IS_IN_COM.toString());
        if (klBBLL.IS_IN_COM) {
            document.body.classList.add('kl-in-com');
        } else {
            document.body.classList.remove('kl-in-com');
        }
        klBBLL.warn(`切换 klBBLL.is_in_company [${klBBLL.IS_IN_COM}]`);
    },
    lib: {
        addMsg: text => {
            klBBLL.desk.msgsBox.classList.add('fade-out');
            klBBLL.desk.msgsBox.style.animation = 'none';
            klBBLL.desk.msgsBox.offsetHeight; // 触发回流
            klBBLL.desk.msgsBox.style.animation = 'fadeOut 5s forwards';

            //  klBBLL.desk.msgsBox.classList.remove('fade-out');
            //
            if (klBBLL.desk.msgsBox.children.length > 0) {
                klBBLL.desk.msgsBox.insertBefore(kl.HTML.PARAGRAPH('', (new Date()).toLocaleTimeString() + `:${text}`), klBBLL.desk.msgsBox.firstElementChild);
            } else {
                klBBLL.desk.msgsBox.addNodes([kl.HTML.PARAGRAPH('', (new Date()).toLocaleTimeString() + `:${text}`),]);
            }

        },
        hoverElement: function (element) {
            if (!element) {
                klBBLL.lib.addMsg('hoverElement 调用错误');
                return false;
            }
            const mouseOverEvent = new MouseEvent("mouseover", {
                bubbles: true,    // 是否冒泡
                cancelable: true, // 是否可以取消
                view: window      // 关联的 window 对象
            });
            element.dispatchEvent(mouseOverEvent);
        },
        hoverEnterElement: function (element) {
            if (!element) {
                klBBLL.lib.addMsg('hoverEnterElement 调用错误');
                return false;
            }
            const mouseOverEvent = new MouseEvent("mouseenter", {
                bubbles: true,    // 是否冒泡
                cancelable: true, // 是否可以取消
                view: window      // 关联的 window 对象
            });
            element.dispatchEvent(mouseOverEvent);
        },
        hoverOutElement: function (element) {
            if (!element) {
                klBBLL.lib.addMsg('hoverOutElement 调用错误');
                return false;
            }
            const mouseOverEvent = new MouseEvent("mouseleave", {
                bubbles: true,    // 是否冒泡
                cancelable: true, // 是否可以取消
                view: window      // 关联的 window 对象
            });
            element.dispatchEvent(mouseOverEvent);
        },
        keyInput: function (keyCode) {
            let tmpKV = {
                Space: 32,
                Escape: 27,
                Backspace: 8,
                Enter: 13,
                Delete: 46,
                ContextMenu: 93,

            };
            let code2val = {
                Space: ' ',
            };
            let keyAsciiCode = tmpKV[keyCode];
            let eventInitDict = {
                key: code2val[keyCode] || keyCode,
                code: keyCode,
                keyCode: keyAsciiCode,  // 空格键的 keyCode
                which: keyAsciiCode,
                bubbles: true,
                cancelable: true
            };

            // 触发事件（在特定元素上）
            // const element = document.getElementById('targetElement');
            console.log(eventInitDict);
            document.body.dispatchEvent(new KeyboardEvent('keydown', eventInitDict));
            document.body.dispatchEvent(new KeyboardEvent('keyup', eventInitDict));

        },
        click: function (element) {
            element.dispatchEvent(new MouseEvent("click", {bubbles: true}));
        },
        getElementLeft: (element) => {
            var actualLeft = element.offsetLeft;
            var current = element.offsetParent;

            while (current !== null) {
                actualLeft += current.offsetLeft;
                current = current.offsetParent;
            }

            return actualLeft;
        },

        getElementTop: (element) => {
            var actualTop = element.offsetTop;
            var current = element.offsetParent;

            while (current !== null) {
                actualTop += current.offsetTop;
                current = current.offsetParent;
            }

            return actualTop;
        },
        getElementByClassName: (className, funName) => {
            let eles = document.getElementsByClassName(className);
            if (eles.length === 1) {
                if (funName) {
                    HTMLElement.prototype[funName].call(eles[0]);
                }
                return eles[0];

            } else if (eles.length > 1) {
                kl.error(`获取元素错误，请检查元素名称 [${className}]`);
                return false;
            } else {
                return false;
            }
        },

    },
    areaKeys: [],
    areaKV: {
        settingArea: {
            title: '设置',
            isInitedArea: true,
            isElesCountFixed: true,
            KeyCodeKV: {
                ArrowUp: true,
                ArrowDown: true,
                ArrowLeft: true,
                ArrowRight: true,
                Enter: () => {
                    klBBLL.log(klBBLL.CURR_AREA.CURR_ELE);
                    let as = kl.xpathSearch('.//a', klBBLL.CURR_AREA.CURR_ELE);
                    klBBLL.log(as);
                    if (as.length > 0) {
                        //    as[0].click();
                        if (as[0].isOpenSelf === true) {
                            window.location.href = as[0].href;
                        } else {
                            window.open(as[0].href);
                        }

                        //  klBBLL.videoPlayerIframe.classList.remove('hide');
                    }

                },
                Delete: () => {

                    //  document.querySelector('video').requestFullscreen();
                    window.close();
                },
                ContextMenu: () => {
                    klBBLL.warn('总菜单触发菜单 不能使用，会连环 触发');

                    return false;
                    if (klBBLL.areaKV.settingArea._REFFRE_AREA) {
                        klBBLL.areaKV.settingArea._REFFRE_AREA.enterArea(klBBLL.areaKV.settingArea);
                    }
                },
            },
            menusDiv: kl.HTML.DIV('class="kl-setting-area color-bg-1"').addNodes([new Emt('h3', '', '设置')]),
            chanelsDiv: kl.HTML.DIV('class="kl-channels-area color-bg-1"').addNodes([new Emt('h3', '', '频道')]),

            eles: [],
            _init: () => {
                document.body.append(
                    klBBLL.desk.modal.addNodes([
                        klBBLL.areaKV.settingArea.menusDiv,
                        klBBLL.areaKV.settingArea.chanelsDiv,
                    ]),
                    klBBLL.desk.msgsBox,
                );
            },
            makeElesFuns: [
                (funIndex) => {

                    klBBLL.areaKV.settingArea.eles = [
                        ['首页', 'https://www.bilibili.com', {isOpenSelf: true}],
                        ['订阅', 'https://t.bilibili.com/?tab=video'],
                        ['历史', 'https://www.bilibili.com/history']
                    ].map(ar => {
                        return kl.HTML.DIV().addNodes([kl.HTML.ANCHOR('', ar[0], Object.assign({href: ar[1]}, ar[2] || {}))]);
                    });
                    klBBLL.areaKV.settingArea.menusDiv.addNodes(klBBLL.areaKV.settingArea.eles);

                    let eles = [];

                    let as = [
                        {"href": "https://www.bilibili.com/v/popular/all", "text": "热门"},
                        {"href": "https://www.bilibili.com/anime/", "text": "番剧"},
                        {"href": "https://www.bilibili.com/movie/", "text": "电影"},
                        {"href": "https://www.bilibili.com/guochuang/", "text": "国创"},
                        {"href": "https://www.bilibili.com/tv/", "text": "电视剧"},
                        {"href": "https://www.bilibili.com/variety/", "text": "综艺"},
                        {"href": "https://www.bilibili.com/documentary/", "text": "纪录片"},
                        {"href": "https://www.bilibili.com/c/douga/", "text": "动画"},
                        {"href": "https://www.bilibili.com/c/game/", "text": "游戏"},
                        {"href": "https://www.bilibili.com/c/kichiku/", "text": "鬼畜"},
                        {"href": "https://www.bilibili.com/c/music/", "text": "音乐"},
                        {"href": "https://www.bilibili.com/c/dance/", "text": "舞蹈"},
                        {"href": "https://www.bilibili.com/c/cinephile/", "text": "影视"},
                        {"href": "https://www.bilibili.com/c/ent/", "text": "娱乐"},
                        {"href": "https://www.bilibili.com/c/knowledge/", "text": "知识"},
                        {"href": "https://www.bilibili.com/c/tech/", "text": "科技数码"},
                        {"href": "https://www.bilibili.com/c/information/", "text": "资讯"},
                        {"href": "https://www.bilibili.com/c/food/", "text": "美食"},
                        {"href": "https://www.bilibili.com/c/shortplay/", "text": "小剧场"},
                        {"href": "https://www.bilibili.com/read/home/", "text": "专栏"},
                        {"href": "https://live.bilibili.com/", "text": "直播"},
                        {"href": "https://www.bilibili.com/cheese/", "text": "课堂"},
                        {"href": "https://www.bilibili.com/c/car", "text": "汽车"},
                        {"href": "https://www.bilibili.com/c/fashion/", "text": "时尚美妆"},
                        {"href": "https://www.bilibili.com/c/sports/", "text": "体育运动"},
                        {"href": "https://www.bilibili.com/c/animal/", "text": "动物"},
                        {"href": "https://www.bilibili.com/c/vlog/", "text": "vlog"},
                        {"href": "https://www.bilibili.com/c/painting/", "text": "绘画"},
                        {"href": "https://www.bilibili.com/c/ai/", "text": "人工智能"},
                        {"href": "https://www.bilibili.com/c/home/", "text": "家装房产"},
                        {"href": "https://www.bilibili.com/c/outdoors/", "text": "户外潮流"},
                        {"href": "https://www.bilibili.com/c/gym/", "text": "健身"},
                        {"href": "https://www.bilibili.com/c/handmake/", "text": "手工"},
                        {"href": "https://www.bilibili.com/c/travel/", "text": "旅游出行"},
                        {"href": "https://www.bilibili.com/c/rural/", "text": "三农"},
                        {"href": "https://www.bilibili.com/c/parenting/", "text": "亲子"},
                        {"href": "https://www.bilibili.com/c/health/", "text": "健康"},
                        {"href": "https://www.bilibili.com/c/emotion/", "text": "情感"},
                        {"href": "https://www.bilibili.com/c/life_joy/", "text": "生活兴趣"},
                        {"href": "https://www.bilibili.com/c/life_experience/", "text": "生活经验"},
                        {"href": "https://love.bilibili.com/", "text": "公益"},
                        {"href": "https://www.bilibili.com/blackboard/era/Vp41b8bsU9Wkog3X.html", "text": "超高清"},
                        {"href": "https://game.bilibili.com/platform", "text": "游戏中心"},
                        {"href": "https://show.bilibili.com/platform/home.html?msource=pc_web", "text": "会员购"},
                        {"href": "https://manga.bilibili.com/?from=bill_top_mnav", "text": "漫画"},
                        {"href": "https://www.bilibili.com/match/home/", "text": "赛事"},
                        {"href": "https://www.bilibili.com/festival/1fzdhjc", "text": "1分钟1分钟"},
                        {"href": "https://space.bilibili.com/27183596", "text": ""},
                        {"href": "https://account.bilibili.com/big", "text": "大会员"},
                        {"href": "https://www.bilibili.com/cheese/?csource=common_hp_channelclass_icon", "text": "课堂"}
                    ];
                    klBBLL.log('as:', as);
                    as.forEach(a => {

                        let tmpEle = kl.HTML.DIV().addNodes([kl.HTML.ANCHOR('', a.text, {href: a.href})]);


                        eles.push(tmpEle);
                        klBBLL.areaKV.settingArea.chanelsDiv.addNodes([tmpEle]);
                        klBBLL.areaKV.settingArea.eles.push(tmpEle);

                    });


                    delete klBBLL.areaKV.settingArea.makeElesFuns[funIndex];
                    return [];
                },
            ],
            _show: () => {
                klBBLL.warn('进入菜单 _show');
                klBBLL.desk.modal.classList.remove('hide');
            },
            _enterArea: function (reffreArea) {
                klBBLL.warn('进入菜单');

                //  klBBLL.lib.hoverEnterElement(klBBLL.areaKV.videoVoiceArea.barRootEle);
            },
            _exitArea: function () {
                klBBLL.desk.modal.classList.add('hide');
            },
        },
        DefaultArea: {
            title: '默认，未做',
            eles: [kl.HTML.DIV()],
            KeyCodeKV: {
                ArrowUp: true,
                ArrowDown: true,
                Enter: () => {
                    // 创建并触发 keydown 事件
                    const keydownEvent = new KeyboardEvent('keydown', {
                        key: ' ',
                        code: 'Space',
                        keyCode: 32,  // 空格键的 keyCode
                        which: 32,
                        bubbles: true,
                        cancelable: true
                    });

                    // 创建并触发 keyup 事件
                    const keyupEvent = new KeyboardEvent('keyup', {
                        key: ' ',
                        code: 'Space',
                        keyCode: 32,
                        which: 32,
                        bubbles: true,
                        cancelable: true
                    });

                    // 触发事件（在特定元素上）
                    // const element = document.getElementById('targetElement');
                    document.dispatchEvent(keydownEvent);
                    document.dispatchEvent(keyupEvent);
                    //  document.dispatchEvent()
                },
                //这个是setting图标，
                Backspace: () => {
                    klBBLL.areaKV.settingArea.setLeftAreaObj(klBBLL.areaKV.videoEmptyArea);
                    klBBLL.areaKV.settingArea.enterArea(klBBLL.areaKV.videoEmptyArea);
                },
                //setting 图标右边的，以为是退出
                Delete: () => {
                    //  document.querySelector('video').requestFullscreen();
                    window.close();
                },
                ContextMenu: () => {
                    //右击菜单效果  也拦不住
                    //window.close();
                    klBBLL.warn('播放器触发菜单');
                    klBBLL.areaKV.videoOptionArea.enterArea(klBBLL.areaKV.DefaultArea);
                },
            },
            makeElesFuns: [],
            _enterArea: function () {
                kl.log('进入', klBBLL.areaKV.DefaultArea);
            },
            _exitArea: function () {
                kl.log('退出', klBBLL.areaKV.DefaultArea);
            },

        },

        rcmdVideoArea: {
            title: '推荐视频',
            isInitedArea: false,
            xy2DArrayType:'root',
            KeyCodeKV: {
                ArrowUp: true,
                ArrowDown: true,
                ArrowLeft: true,
                ArrowRight: true,
                Enter: () => {
                    if (klBBLL.CURR_AREA.CURR_ELE.isVideoLinkEle) {
                        klBBLL.log(klBBLL.CURR_AREA.CURR_ELE);
                        let as = kl.xpathSearch('.//a', klBBLL.CURR_AREA.CURR_ELE);
                        klBBLL.log(as);
                        if (as.length > 0) {
                            //    as[0].click();
                            window.open(as[0].href);
                            //  klBBLL.videoPlayerIframe.classList.remove('hide');
                        }
                    }
                },
                Delete: () => {
                    document.location.reload();
                    return false;
                    //  document.querySelector('video').requestFullscreen();
                    window.close();
                },
                ContextMenu: () => {
                    klBBLL.areaKV.settingArea.enterArea(klBBLL.areaKV.rcmdVideoArea);
                },
            },
            xpaths: [
                //`.//main//div[contains(@class,'bili-video-card ') and not(@has-kl-flag)]`,
            ],
            makeElesFuns: [
                () => {

                    let ar = [];
                    let tmp_ar = document.getElementsByClassName('container');
                    if (tmp_ar.length !== 1) {
                        klBBLL.error('container 定位错误', tmp_ar);
                        return [];
                    }

                    Object.values(tmp_ar[0].children).forEach((tmpEle, index) => {

                        if (tmpEle.klTryTimes === undefined) {
                            tmpEle.klTryTimes = 0;
                        } else if (tmpEle.klTryTimes === -1) {
                            return false;
                        }
                        //有些item 惰加载,超过5次直接放弃
                        if (tmpEle.klTryTimes > 5) {
                            klBBLL.log('有些item 惰加载,超过5次直接放弃',tmpEle, tmpEle.className, tmpEle.hasKlMark, tmpEle.classList.contains('bili-video-card') || tmpEle.classList.contains('feed-card'), tmpEle.hasKlMark !== true && (tmpEle.classList.contains('bili-video-card') || tmpEle.classList.contains('feed-card')));
                            tmpEle.klTryTimes = -1;
                            return false;
                        }
                        if (tmpEle.hasKlMark !== true) {
                            // tmpEle.setAttribute('has-kl-flag', '');
                            tmpEle.classList.add('kl-flag-ele');
                            tmpEle.setAttribute('has-kl-flag', 'yes');
                            let span = new Emt('span', 'class="kl-test"', '####');
                            tmpEle.insertBefore(span, tmpEle.firstElementChild);
                            let index = Array.prototype.indexOf.call(tmpEle.parentNode.childNodes, tmpEle);
                            span.textContent = `top:${tmpEle.offsetTop}  left:${tmpEle.offsetLeft} index:${index}`;
                            tmpEle.isKlElement = true;
                            ar.push(tmpEle);
                            tmpEle.classList.add('kl-flag-ele');
                            tmpEle.klTryTimes = -1;
                            tmpEle.infoSpan = span;
                            tmpEle.isKlElement = true;
                            tmpEle.isVideoLinkEle = true;
                        } else {
                            tmpEle.klTryTimes += 1;
                        }
                        if (index === 0) {

                        }
                        // tmpEle.hasKlMark = true;
                        tmpEle.setAttribute('has-kl-flag', 'yes');


                    });
                    if (ar.length > 0) {
                        klBBLL.CURR_AREA.init2DArray();
                        if (!klBBLL.CURR_AREA.CURR_ELE) {
                            klBBLL.CURR_AREA.move.flushCurrentEleInfo(0);
                        }
                    }
                    return ar;
                },
            ],
            eles: [],
            _enterArea: function (reffreArea) {
            },
            _exitArea: function () {

            },
        },
        subscribeVideoArea: {
            title: '订阅视频',
            isInitedArea: false,
            KeyCodeKV: {
                ArrowUp: true,
                ArrowDown: true,
                ArrowLeft: true,
                ArrowRight: true,
                Enter: () => {

                    klBBLL.log(klBBLL.CURR_AREA.CURR_ELE);
                    let as = kl.xpathSearch('.//a', klBBLL.CURR_AREA.CURR_ELE);
                    klBBLL.log(as);

                    if (as.length > 0) {
                        Object.values(as).forEach(a => {
                            if (a.href.indexOf('/video/') > -1) {
                                window.open(a.href);
                            }
                        });
                        //    as[0].click();

                        //  klBBLL.videoPlayerIframe.classList.remove('hide');
                    }

                },
                Delete: () => {
                    //  document.querySelector('video').requestFullscreen();
                    window.close();
                },
                ContextMenu: () => {
                    klBBLL.areaKV.settingArea.enterArea(klBBLL.areaKV.subscribeVideoArea);
                },
                ArrowDownFalse: () => {
                    klBBLL.warn('到头了 zzz');
                    document.scrollingElement.scrollTop += 500;
                    let evt = window.document.createEvent('UIEvent');
                    evt.initUIEvent('scroll', true, false, window, 0);
                    window.dispatchEvent(evt)
                },
            },
            xpaths: [
                //`.//main//div[contains(@class,'bili-video-card ') and not(@has-kl-flag)]`,
            ],
            tmpCount: {},
            makeElesFuns: [
                (funIndex) => {
                    let countTimes = (klBBLL.areaKV.subscribeVideoArea.tmpCount[funIndex] || 0) + 1;
                    klBBLL.areaKV.subscribeVideoArea.tmpCount[funIndex] = countTimes;
                    let tmpAr = Object.values(document.querySelectorAll('section'));

                    tmpAr.forEach(tmpEle => {
                        if (tmpEle.getElementsByClassName('bili-dyn-list').length === 0) {
                            tmpEle.classList.add('unavailable-ele');
                        } else {
                            // console.log('section', tmpEle);
                            tmpEle.style.zIndex = '999999';
                            tmpEle.style.background = '#FFF';
                        }
                    });
                    Object.values(document.querySelectorAll('aside')).forEach((tmpEle) => {
                        tmpEle.classList.add('unavailable-ele');
                    });
                    if (countTimes > 10) {
                        delete klBBLL.areaKV.subscribeVideoArea.makeElesFuns[funIndex];
                    }
                    return [];

                },
                (funIndex) => {
                    document.querySelector('main').parentElement.style.width = '100%';
                    document.querySelector('main').style.width = '100%';
                    //   console.log(document.querySelector('main'), document.querySelector('main').parentElement);
                    document.body.classList.add('kl-history');
                    delete klBBLL.areaKV.subscribeVideoArea.makeElesFuns[funIndex];
                    return [];

                },
                () => {

                    let ar = [];
                    let tmp_ar = document.getElementsByClassName('bili-dyn-list__items');
                    if (tmp_ar.length !== 1) {
                        klBBLL.error('[bili-dyn-list__items] 定位错误', tmp_ar);
                        return [];
                    }

                    Object.values(tmp_ar[0].children).forEach((tmpEle, index) => {

                        if (tmpEle.hasKlMark !== true) {
                            // tmpEle.setAttribute('has-kl-flag', '');
                            tmpEle.classList.add('kl-flag-ele');
                            tmpEle.setAttribute('has-kl-flag', 'yes');
                            let span = new Emt('span', 'class="kl-test"', '####');
                            tmpEle.insertBefore(span, tmpEle.firstElementChild);
                            let index = Array.prototype.indexOf.call(tmpEle.parentNode.childNodes, tmpEle);
                            span.textContent = `top:${tmpEle.offsetTop}  left:${tmpEle.offsetLeft} index:${index}`;
                            tmpEle.isKlElement = true;
                            ar.push(tmpEle);
                            tmpEle.classList.add('kl-flag-ele');
                            tmpEle.klTryTimes = -1;
                            tmpEle.infoSpan = span;
                            tmpEle.isKlElement = true;
                            tmpEle.isVideoLinkEle = true;
                        } else {
                            tmpEle.klTryTimes += 1;
                        }
                        if (index === 0) {

                        }
                        tmpEle.hasKlMark = true;
                        tmpEle.setAttribute('has-kl-flag', 'yes');


                    });
                    if (ar.length > 0) {
                        klBBLL.CURR_AREA.init2DArray();
                        if (!klBBLL.CURR_AREA.CURR_ELE) {
                            klBBLL.CURR_AREA.move.flushCurrentEleInfo(0);
                        }
                    }
                    return ar;
                },
            ],
            eles: [],
            _enterArea: function (reffreArea) {
            },
            _exitArea: function () {

            },
        },
        historyArea: {
            title: '历史',
            isInitedArea: false,
            KeyCodeKV: {
                ArrowUp: true,
                ArrowDown: true,
                ArrowDownFalse: () => {
                    klBBLL.log('到底了');
                    document.scrollingElement.scrollTop += 500;
                    //klBBLL.lib.keyInput('Space');
                },

                ArrowLeft: true,
                ArrowRight: true,
                Enter: () => {
                    klBBLL.log(klBBLL.CURR_AREA.CURR_ELE);
                    let as = kl.xpathSearch('.//a', klBBLL.CURR_AREA.CURR_ELE);
                    klBBLL.log(as);

                    if (as.length > 0) {
                        Object.values(as).forEach(a => {
                            if (a.href.indexOf('/video/') > -1) {
                                window.open(a.href);
                            }
                        });
                        //    as[0].click();

                        //  klBBLL.videoPlayerIframe.classList.remove('hide');
                    }

                },
                Delete: () => {
                    //  document.querySelector('video').requestFullscreen();
                    window.close();
                },
                ContextMenu: () => {
                    klBBLL.areaKV.settingArea.enterArea(klBBLL.areaKV.historyArea);
                },
            },
            xpaths: [],
            makeElesFuns: [
                () => {
                    let ar = [];
                    Object.values(document.getElementsByClassName('history-card')).forEach((tmpEle, index) => {

                        if (tmpEle.hasKlMark !== true) {
                            // tmpEle.setAttribute('has-kl-flag', '');
                            tmpEle.classList.add('kl-flag-ele');
                            tmpEle.setAttribute('has-kl-flag', 'yes');
                            let span = new Emt('span', 'class="kl-test"', '####');
                            tmpEle.insertBefore(span, tmpEle.firstElementChild);
                            let index = Array.prototype.indexOf.call(tmpEle.parentNode.childNodes, tmpEle);
                            span.textContent = `top:${tmpEle.offsetTop}  left:${tmpEle.offsetLeft} index:${index}`;
                            tmpEle.isKlElement = true;
                            ar.push(tmpEle);
                            tmpEle.classList.add('kl-flag-ele');
                            tmpEle.klTryTimes = -1;
                            tmpEle.infoSpan = span;
                            tmpEle.isKlElement = true;
                            tmpEle.isVideoLinkEle = true;
                        } else {
                            tmpEle.klTryTimes += 1;
                        }
                        if (index === 0) {

                        }
                        tmpEle.hasKlMark = true;
                        tmpEle.setAttribute('has-kl-flag', 'yes');


                    });
                    if (ar.length > 0) {
                        klBBLL.CURR_AREA.init2DArray();
                        if (!klBBLL.CURR_AREA.CURR_ELE) {
                            klBBLL.CURR_AREA.move.flushCurrentEleInfo(0);
                        }
                    }
                    return ar;
                },
            ],
            eles: [],
            _enterArea: function (reffreArea) {
            },
            _exitArea: function () {

            },
        },
        videoEmptyArea: {
            title: '视频播放器-空白-上下退出',
            eles: [kl.HTML.DIV()],
            toggleFullScreenBtn: false,
            toggleSubtitleBtn: false,
            toggleDanmuBtn: false,
            durationBar: false,
            hoverDurationBarCountDownNum: 0,
            toggleFullScreen: (isFullScreen) => {
                if (klBBLL.areaKV.videoEmptyArea.toggleFullScreenBtn) {
                    if (isFullScreen === undefined) {
                        klBBLL.areaKV.videoEmptyArea.toggleFullScreenBtn.click();
                    } else {
                        let isNowFullScreen = (document.querySelector('video').offsetWidth * 1.2) > document.body.clientWidth;
                        klBBLL.warn('当前是否为全屏', isNowFullScreen);
                        if (isFullScreen) {
                            if (isNowFullScreen === false) {
                                klBBLL.areaKV.videoEmptyArea.toggleFullScreenBtn.click();
                            }
                        } else {
                            if (isNowFullScreen) {
                                klBBLL.areaKV.videoEmptyArea.toggleFullScreenBtn.click();
                            }
                        }
                    }
                } else {
                    kl.error('未找到全屏按钮');
                }
                // document.getElementsByClassName('bpx-player-ctrl-full')[0].click();
            },

            toggleSubtitle: () => {
                if (klBBLL.areaKV.videoEmptyArea.toggleSubtitleBtn) {
                    klBBLL.areaKV.videoEmptyArea.toggleSubtitleBtn.click();
                } else {
                    kl.error('未找到弹幕按钮');
                }
            },
            KeyCodeKV: {
                ArrowUp: function () {
                    // document.getElementsByClassName('bpx-player-ctrl-full')[0].click();
                    //  document.querySelector('video').requestFullscreen();
                    if (klBBLL.areaKV.videoEmptyArea.up1 === undefined) {
                        klBBLL.areaKV.videoEmptyArea.up1 = true;
                        klBBLL.areaKV.videoEmptyArea.toggleFullScreenBtn.click();
                        klBBLL.areaKV.videoEmptyArea.KeyCodeKV.ArrowUp = false;
                    } else {
                        let max = window.player.getDuration();
                        let now = window.player.getCurrentTime();
                        let diff = max / 100;
                        if (diff < 60) {
                            diff = 60;
                        }
                        let expect = now + diff;
                        if (expect < max) {
                            window.player.seek(expect);
                        }
                        klBBLL.areaKV.videoEmptyArea.hoverDurationBarCountDownNum = 5;
                    }

                },

                ArrowDown: function () {
                    let max = window.player.getDuration();
                    let now = window.player.getCurrentTime();
                    let diff = max / 100;
                    if (diff < 60) {
                        diff = 60;
                    }
                    let expect = now - diff;
                    if (expect > 0) {
                        window.player.seek(expect);
                    }
                    klBBLL.areaKV.videoEmptyArea.hoverDurationBarCountDownNum = 5;

                },
                Enter: () => {
                    // 创建并触发 keydown 事件
                    const keydownEvent = new KeyboardEvent('keydown', {
                        key: ' ',
                        code: 'Space',
                        keyCode: 32,  // 空格键的 keyCode
                        which: 32,
                        bubbles: true,
                        cancelable: true
                    });

                    // 创建并触发 keyup 事件
                    const keyupEvent = new KeyboardEvent('keyup', {
                        key: ' ',
                        code: 'Space',
                        keyCode: 32,
                        which: 32,
                        bubbles: true,
                        cancelable: true
                    });

                    // 触发事件（在特定元素上）
                    // const element = document.getElementById('targetElement');
                    document.dispatchEvent(keydownEvent);
                    document.dispatchEvent(keyupEvent);
                    //  document.dispatchEvent()
                },
                Escape: () => {
                    //  klBBLL.areaKV.settingArea.setLeftAreaObj(klBBLL.areaKV.videoEmptyArea);
                    // klBBLL.areaKV.settingArea.enterArea(klBBLL.areaKV.videoEmptyArea);
                    // document.getElementsByClassName('bpx-player-ctrl-full')[0].click();
                },


                //这个是setting图标，
                Backspace: () => {
                    klBBLL.areaKV.settingArea.setLeftAreaObj(klBBLL.areaKV.videoEmptyArea);
                    klBBLL.areaKV.settingArea.enterArea(klBBLL.areaKV.videoEmptyArea);
                },
                //setting 图标右边的，以为是退出
                Delete: () => {
                    //  document.querySelector('video').requestFullscreen();
                    window.close();
                },


                BrowserBack: () => {
                    //home旁边的以为是 escape ，没想到这个返回是 浏览器返回

                },
                BrowserHome: () => {
                    //这个是home  拦截不住
                    window.close();
                },
                ContextMenu: () => {
                    //右击菜单效果  也拦不住
                    //window.close();
                    klBBLL.warn('播放器触发菜单');
                    klBBLL.areaKV.videoOptionArea.enterArea(klBBLL.areaKV.videoEmptyArea);
                },


                AudioVolumeMute: false,//静音切换
                AudioVolumeDown: false,//系统音量
                AudioVolumeUp: false,
            },
            makeElesFuns: [
                (funIndex) => {
                    if (klBBLL.areaKV.videoEmptyArea.durationBar === false) {
                        klBBLL.areaKV.videoEmptyArea.durationBar = klBBLL.lib.getElementByClassName('bpx-player-control-wrap');
                    } else {
                        if (klBBLL.areaKV.videoEmptyArea.hoverDurationBarCountDownNum > 0) {
                            klBBLL.areaKV.videoEmptyArea.hoverDurationBarCountDownNum -= 1;
                            klBBLL.lib.hoverEnterElement(klBBLL.areaKV.videoEmptyArea.durationBar);
                        } else {
                            klBBLL.lib.hoverOutElement(klBBLL.areaKV.videoEmptyArea.durationBar);
                        }
                    }
                },
                (funIndex) => {

                    if (klBBLL.areaKV.videoEmptyArea.toggleFullScreenBtn === false && document.getElementsByClassName('bpx-player-ctrl-full').length === 1) {
                        klBBLL.areaKV.videoEmptyArea.toggleFullScreenBtn = document.getElementsByClassName('bpx-player-ctrl-full')[0];
                        delete klBBLL.areaKV.videoEmptyArea.makeElesFuns[funIndex];

                    } else {
                        //  klBBLL.warn('全屏按钮',klBBLL.areaKV.videoEmptyArea.toggleFullScreenBtn===false,document.getElementsByClassName('bpx-player-ctrl-full'));
                    }
                    //window.player.play()
                    //window.player.pause()
                },
                (funIndex) => {

                    if (klBBLL.areaKV.videoEmptyArea.toggleSubtitleBtn === false && document.getElementsByClassName('bpx-player-ctrl-subtitle').length === 1) {
                        klBBLL.areaKV.videoEmptyArea.toggleSubtitleBtn = document.getElementsByClassName('bpx-player-ctrl-subtitle')[0];
                        delete klBBLL.areaKV.videoEmptyArea.makeElesFuns[funIndex];

                    }

                },
                (funIndex) => {
                    if (klBBLL.areaKV.videoEmptyArea.toggleDanmuBtn === false && document.getElementsByClassName('bui-danmaku-switch-input').length === 1) {
                        klBBLL.areaKV.videoEmptyArea.toggleDanmuBtn = document.getElementsByClassName('bui-danmaku-switch-input')[0];
                        delete klBBLL.areaKV.videoEmptyArea.makeElesFuns[funIndex];

                    }
                },

            ],
            _enterArea: function () {
                kl.log('进入', klBBLL.areaKV.videoEmptyArea);
                klBBLL.areaKV.videoEmptyArea.toggleFullScreen(true);
            },
            _exitArea: function () {
                kl.log('退出', klBBLL.areaKV.videoEmptyArea);
                klBBLL.areaKV.videoEmptyArea.toggleFullScreen(false);
            },

        },

        videoOptionArea: {
            title: '视频播放器-选项',
            isInitedArea: false,
            isElesCountFixed: true,
            KeyCodeKV: {
                ArrowUp: true,
                ArrowDown: true,
                ArrowLeft: true,
                ArrowRight: true,
                Enter: () => {
                    klBBLL.log(`Enter:`, klBBLL.areaKV.videoOptionArea.CURR_ELE);
                    klBBLL.areaKV.videoOptionArea.CURR_ELE.click();
                    //klBBLL.areaKV.videoOptionArea.CURR_ELE.dispatchEvent(new Event('click'));

                },
                ContextMenu: () => {

                    klBBLL.warn('菜单触发菜单');
                    klBBLL.areaKV.videoOptionArea.enterArea(klBBLL.areaKV.videoEmptyArea);
                },
            },
            div: kl.HTML.DIV('class="kl-video-opt color-bg-1 hide"'),
            optTable: kl.HTML.TABLE(),
            eles: [],
            barRootEle: false,
            _init: function () {
                document.body.classList.add('kl-video-page');
                document.body.append(klBBLL.areaKV.videoOptionArea.div.addNodes([klBBLL.areaKV.videoOptionArea.optTable]));
            },
            makeElesFuns: [

                (funIndex) => {
                    let checkboxInput = kl.HTML.CHECKBOX('', '', {checked: window.player.danmaku.isOpen()});
                    let span = kl.HTML.SPAN();
                    let label = kl.HTML.LABEL();
                    let tr = klBBLL.areaKV.videoOptionArea.optTable.insertRow();
                    tr.insertCell().textContent = '弹幕';
                    tr.insertCell().appendChild(label.addNodes([checkboxInput, span]));

                    klBBLL.areaKV.videoOptionArea.eles.push(label);
                    checkboxInput.addEventListener('change', () => {
                        if (window.player.danmaku.isDisabled()) {
                            klBBLL.lib.addMsg('弹幕被禁用了');
                        } else {
                            if (checkboxInput.checked) {
                                window.player.danmaku.open();
                            } else {
                                window.player.danmaku.close();
                            }
                        }

                    });
                    delete klBBLL.areaKV.videoOptionArea.makeElesFuns[funIndex];
                },
                (funIndex) => {
                    let btn = kl.HTML.BUTTON_BUTTON('', '字幕');
                    let tr = klBBLL.areaKV.videoOptionArea.optTable.insertRow();
                    tr.insertCell().textContent = '字幕';
                    tr.insertCell().appendChild(btn);
                    klBBLL.areaKV.videoOptionArea.eles.push(btn);
                    btn.onclick = klBBLL.areaKV.videoEmptyArea.toggleSubtitle;
                    delete klBBLL.areaKV.videoOptionArea.makeElesFuns[funIndex];
                },
                (funIndex) => {
                    let ar = Object.values(document.getElementsByClassName('bpx-player-ctrl-quality-menu-item'));
                    if (ar.length > 0) {
                        let tr = klBBLL.areaKV.videoOptionArea.optTable.insertRow();
                        tr.insertCell().textContent = '清晰度';
                        ar.map(ele => {
                            let btn = kl.HTML.BUTTON_BUTTON('', ele.textContent);
                            klBBLL.areaKV.videoOptionArea.eles.push(btn);
                            btn.addEventListener('click', () => {
                                window.player.requestQuality(ele.getAttribute('data-value'));
                            });
                            tr.insertCell().appendChild(btn);
                        });
                        delete klBBLL.areaKV.videoOptionArea.makeElesFuns[funIndex];
                    }
                },
                (funIndex) => {
                    let ar = Object.values(document.getElementsByClassName('bpx-player-ctrl-playbackrate-menu-item'));
                    if (ar.length > 0) {
                        let tr = klBBLL.areaKV.videoOptionArea.optTable.insertRow();
                        tr.insertCell().textContent = '速度';
                        ar.map(ele => {
                            let btn = kl.HTML.BUTTON_BUTTON('', ele.textContent);
                            klBBLL.areaKV.videoOptionArea.eles.push(btn);
                            btn.addEventListener('click', () => {
                                window.player.setPlaybackRate(ele.getAttribute('data-value'));
                            });
                            tr.insertCell().appendChild(btn);
                        });
                        delete klBBLL.areaKV.videoOptionArea.makeElesFuns[funIndex];
                    }
                },

                //document.getElementsByClassName('bpx-player-ctrl-quality-menu-item')
            ],


            _exitArea: function () {
                kl.log('退出', klBBLL.areaKV.videoOptionArea);
                klBBLL.areaKV.videoOptionArea.hide();
            },
        },

        videoEplistArea: {
            title: '视频播-分集-列表',
            isInitedArea: false,
            countTimes: 0,
            KeyCodeKV: {
                ArrowUp: true,
                ArrowDown: true,
                ArrowLeft: true,
                ArrowRight: true,
                Enter: () => {
                    klBBLL.log(`Enter:`, klBBLL.areaKV.videoEplistArea.CURR_ELE);
                    klBBLL.areaKV.videoEplistArea.CURR_ELE.click();

                },
                ContextMenu: () => {
                    klBBLL.areaKV.videoOptionArea.enterArea(klBBLL.areaKV.videoEplistArea);
                },
            },
            div: kl.HTML.DIV('class="kl-video-eplist color-bg-1 hide"'),
            eles: [],
            barRootEle: false,
            _init: function () {
                // document.body.classList.add('kl-video-page');
                document.body.append(klBBLL.areaKV.videoEplistArea.div);
            },
            makeElesFuns: [
                (funIndex) => {
                    let ar = document.getElementsByClassName('video-pod__list');
                    if (ar.length === 1) {
                        let epListDiv = kl.HTML.DIV();
                        klBBLL.areaKV.videoEplistArea.div.addNodes([epListDiv]);
                        Object.values(ar[0].children).forEach((tmpEle, tmpI) => {
                            let vid = tmpEle.getAttribute('data-key');
                            let btn = kl.HTML.BUTTON_BUTTON('', tmpI.toString() + ':' + tmpEle.textContent.trim());
                            klBBLL.areaKV.videoEplistArea.eles.push(btn);
                            btn.addEventListener('click', () => {
                                window.location.href = `https://www.bilibili.com/video/${vid}`;

                            });
                            epListDiv.addNode(btn);
                        });
                        delete klBBLL.areaKV.videoEplistArea.makeElesFuns[funIndex];
                    }

                    klBBLL.areaKV.videoEplistArea.countTimes = klBBLL.areaKV.videoEplistArea.countTimes + 1;
                    if (klBBLL.areaKV.videoEplistArea.countTimes > 10) {
                        let btn = kl.HTML.EM('', '未发现分集');
                        klBBLL.areaKV.videoEplistArea.eles.push(btn);
                        klBBLL.areaKV.videoEplistArea.div.addNode(btn);
                        delete klBBLL.areaKV.videoEplistArea.makeElesFuns[funIndex];
                    }
                },
                //document.getElementsByClassName('bpx-player-ctrl-quality-menu-item')
            ],


            _exitArea: function () {
                kl.log('退出', klBBLL.areaKV.videoEplistArea);
                klBBLL.areaKV.videoEplistArea.hide();
            },
        },
        videoRcmdListArea: {
            title: '视频播放-推荐-列表',
            isInitedArea: false,
            moreRecCountTimes: 0,
            fetchRecVideosCountTimes: 0,
            KeyCodeKV: {
                ArrowUp: true,
                ArrowDown: true,
                ArrowLeft: true,
                ArrowRight: true,
                Enter: () => {
                    klBBLL.log(`Enter:`, klBBLL.areaKV.videoRcmdListArea.CURR_ELE);
                    //klBBLL.areaKV.videoRcmdListArea.CURR_ELE.click();
                    klBBLL.log(klBBLL.CURR_AREA.CURR_ELE);
                    let as = kl.xpathSearch('.//a', klBBLL.CURR_AREA.CURR_ELE);
                    klBBLL.log(as);
                    if (as.length > 0) {
                        //    as[0].click();
                        // window.open(as[0].href);
                        window.location.href = as[0].href;
                        //  klBBLL.videoPlayerIframe.classList.remove('hide');
                    }

                },
                ContextMenu: () => {
                    klBBLL.areaKV.videoOptionArea.enterArea(klBBLL.areaKV.videoRcmdListArea);
                },
            },
            // div: kl.HTML.DIV('class="kl-video-eplist color-bg-1 hide"'),
            eles: [],
            barRootEle: false,
            _init: function () {
            },
            makeElesFuns: [
                (funIndex) => {
                    if (klBBLL.lib.getElementByClassName('rec-footer', 'click') !== false) {
                        delete klBBLL.areaKV.videoRcmdListArea.makeElesFuns[funIndex];
                    }
                    klBBLL.areaKV.videoRcmdListArea.moreRecCountTimes = klBBLL.areaKV.videoRcmdListArea.moreRecCountTimes + 1;
                    if (klBBLL.areaKV.videoRcmdListArea.moreRecCountTimes > 10) {
                        let btn = kl.HTML.EM('', '未发现更多推荐视频');
                        klBBLL.areaKV.videoRcmdListArea.eles.push(btn);
                        //     klBBLL.areaKV.videoRcmdListArea.div.addNode(btn);
                        delete klBBLL.areaKV.videoRcmdListArea.makeElesFuns[funIndex];
                    }
                },
                (funIndex) => {
                    let ar = document.getElementsByClassName('rec-list');
                    if (ar.length === 1) {
                        Object.values(ar[0].children).forEach((tmpEle, tmpI) => {
                            if (tmpEle.isFlaged !== true) {
                                klBBLL.areaKV.videoRcmdListArea.eles.push(tmpEle);
                                tmpEle.isFlaged = true;
                            }
                        });
                        //delete klBBLL.areaKV.videoRcmdListArea.makeElesFuns[funIndex];
                    }

                    klBBLL.areaKV.videoRcmdListArea.fetchRecVideosCountTimes = klBBLL.areaKV.videoRcmdListArea.fetchRecVideosCountTimes + 1;
                    if (klBBLL.areaKV.videoRcmdListArea.fetchRecVideosCountTimes > 10) {
                        klBBLL.warn('退出遍历 推荐视频');
                        delete klBBLL.areaKV.videoRcmdListArea.makeElesFuns[funIndex];
                    }
                },
                //document.getElementsByClassName('bpx-player-ctrl-quality-menu-item')
            ],

            _enterArea: function () {
                let listRootEle = klBBLL.lib.getElementByClassName('rec-list');
                if (listRootEle !== false) {
                    if (listRootEle._defaultParnetEle === undefined) {
                        listRootEle._defaultParnetEle = listRootEle.parentElement;
                        document.body.append(listRootEle);
                    }
                    listRootEle.classList.add('kl-video-rcmd-list');
                    klBBLL.areaKV.videoRcmdListArea.init2DArray();
                }
            },
            _exitArea: function () {
                kl.log('退出', klBBLL.areaKV.videoRcmdListArea);
                // klBBLL.areaKV.videoRcmdListArea.hide();
                let listRootEle = klBBLL.lib.getElementByClassName('rec-list');
                if (listRootEle !== false) {
                    if (listRootEle._defaultParnetEle !== undefined) {
                        listRootEle._defaultParnetEle.insertBefore(listRootEle, klBBLL.lib.getElementByClassName('rec-footer'));
                    }
                    listRootEle.classList.remove('kl-video-rcmd-list');
                }
            },
        },
        videoCommentsArea: {
            title: '视频播放-评论-列表',
            isInitedArea: false,
            isElesCountFixed: true,
            KeyCodeKV: {
                ArrowUp: true,
                ArrowDown: true,
                ArrowLeft: true,
                ArrowRight: true,
                Enter: () => {
                    klBBLL.log(`Enter:`, klBBLL.areaKV.videoCommentsArea.CURR_ELE);
                    klBBLL.areaKV.videoCommentsArea.CURR_ELE.click();
                    //klBBLL.areaKV.videoOptionArea.CURR_ELE.dispatchEvent(new Event('click'));

                },
            },
            div: kl.HTML.DIV('class="kl-video-eplist color-bg-1 hide"'),
            eles: [],
            barRootEle: false,
            _init: function () {
                document.body.classList.add('kl-video-page');
                //   document.body.append(klBBLL.areaKV.videoCommentsArea.div.addNodes([klBBLL.areaKV.videoCommentsArea.optTable]));
            },
            makeElesFuns: [
                (funIndex) => {
                    //bpx-player-ctrl-eplist-section-content
                    let ar = document.getElementsByClassName('bpx-player-ctrl-eplist-section-content');
                    if (ar.length === 1) {
                        let epListDiv = kl.HTML.DIV();
                        klBBLL.areaKV.videoCommentsArea.div.addNodes([epListDiv]);
                        Object.values(ar[0].children).forEach((tmpEle, tmpI) => {
                            let btn = kl.HTML.BUTTON_BUTTON('', tmpI.toString() + ':' + tmpEle.textContent.trim());
                            klBBLL.areaKV.videoCommentsArea.eles.push(btn);
                            btn.onclick = tmpEle.onclick;
                            epListDiv.addNode(btn);
                        });

                        delete klBBLL.areaKV.videoCommentsArea.makeElesFuns[funIndex];
                    }
                },
                //document.getElementsByClassName('bpx-player-ctrl-quality-menu-item')
            ],


            _exitArea: function () {
                kl.log('退出', klBBLL.areaKV.videoCommentsArea);
                klBBLL.areaKV.videoCommentsArea.hide();
            },
        },
    },
    desk: {
        /**@var flaat:left 的弹出层*/
        modal: new Emt('div', 'class="kl-desk-modal  hide"'),
        msgsBox: kl.HTML.DIV('class="kl-msgs-box"'),
    },


    initAreaObj: function (blockObj) {
        blockObj.isInitedArea = true;
        blockObj.eles = Array.isArray(blockObj.eles) ? blockObj.eles : [];
        blockObj.leftOut = blockObj.leftOut || false;
        blockObj.rightOut = blockObj.rightOut || false;
        if (blockObj._init) {
            blockObj._init();
        }
        let handle = {
            isKlBlock: true,
            CURR_ELE: false,
            tops: [],
            left: [],
            y2x2ele_KV: {},
            hide: () => {
                if (blockObj.div === undefined) {
                    return false;
                }
                blockObj.div.classList.add('hide');
                if (blockObj.div.parentElement.firstElementChild === blockObj.div) {
                    Object.values(blockObj.div.parentElement.children).map(ele => {
                        ele.classList.add('hide');
                    });
                    blockObj.div.parentElement.classList.add('hide');
                }
            },
            showArea: () => {
                if (blockObj._show) {
                    blockObj._show();
                }
                if (blockObj.div === undefined) {
                    return false;
                }

                blockObj.div.classList.remove('hide');
                blockObj.div.parentElement.classList.remove('hide');


            },
            enterArea: function (reffreArea) {
                klBBLL.CURR_AREA = blockObj;
                if (reffreArea) {
                    blockObj._REFFRE_AREA = reffreArea;
                    reffreArea.exitArea();
                } else {
                    blockObj._REFFRE_AREA = false;
                }
                klBBLL.warn(`enterArea:  ${blockObj.title}`);
                blockObj.showArea();

                klBBLL.CURR_AREA.init2DArray();


                if (blockObj._enterArea && reffreArea) {
                    blockObj._enterArea(reffreArea);
                }

                klBBLL.warn('enterArea', blockObj.title, blockObj.eles);
                blockObj.move.flushCurrentEleInfo(0);
            },
            exitArea: function () {
                klBBLL.warn(`exitArea:  ${blockObj.title}`);
                if (blockObj._exitArea) {
                    blockObj._exitArea();
                } else {
                    blockObj.hide();
                }
            },
            _initAreaEles: function () {
                if (blockObj.isVideoTool) {
                    blockObj.eles.forEach(tmpEle => {
                        if (tmpEle.infoSpan === undefined) {
                            tmpEle.infoSpan = {};
                        }
                    });
                } else {
                    blockObj.eles.forEach(tmpEle => {
                        if (tmpEle.infoSpan === undefined) {
                            let span = new Emt('span', 'class="kl-test"', '####');
                            tmpEle.insertBefore(span, tmpEle.firstElementChild);
                            tmpEle.isKlElement = true;
                            tmpEle.classList.add('kl-flag-ele');
                            tmpEle.infoSpan = span;
                        }
                    });
                }

                return blockObj;
            },
            init2DArray: function () {
                let tops = [];
                let lefts = [];
                let y2x2ele_KV = [];
                klBBLL.log('init2DArray', blockObj.title, blockObj.eles);
                blockObj._initAreaEles();
                blockObj.eles.forEach((tmpEle, tmpIndex) => {
                    if(blockObj.xy2DArrayType==='root'){
                        tmpEle.klX = tmpEle.offsetLeft;
                        tmpEle.klY = tmpEle.offsetTop;
                    }else{
                        //不太适合 历史 动态加载 元素太多
                        const rect = tmpEle.getBoundingClientRect();
                        tmpEle.klX = parseInt(rect.left);
                        tmpEle.klY = parseInt(rect.top);
                    }


                    //  klBBLL.log(tmpEle, tmpIndex, {x: tmpEle.klX, y: tmpEle.klY});
                    if (tops.indexOf(tmpEle.klY) === -1) {
                        tops.push(tmpEle.klY);
                        y2x2ele_KV[tmpEle.klY] = {};
                    }
                    if (lefts.indexOf(tmpEle.klX) === -1) {
                        lefts.push(tmpEle.klX);
                    }
                    y2x2ele_KV[tmpEle.klY][tmpEle.klX] = tmpEle;
                    tmpEle.infoSpan.textContent = `top:${tmpEle.klY}  left:${tmpEle.klX} index:${tmpIndex}`;
                });
                blockObj.tops = tops.sort((a, b) => {
                    return a - b;
                });
                blockObj.lefts = lefts.sort((a, b) => {
                    return a - b;
                });
                blockObj.y2x2ele_KV = y2x2ele_KV;
                if (klBBLL.IS_DEBUG) {
                    console.table(y2x2ele_KV);
                }
            },
            setLeftAreaObj: function (leftAreaObj, isOneway) {
                blockObj.leftAreaObj = leftAreaObj;
                if (isOneway !== true) {
                    blockObj.leftAreaObj.rightAreaObj = blockObj;
                }
            },
            setRightAreaObj: function (rightAreaObj, isOneway) {
                blockObj.rightAreaObj = rightAreaObj;
                if (isOneway !== true) {
                    blockObj.rightAreaObj.leftAreaObj = blockObj;
                }
            },
            setDownAreaObj: function (downAreaObj, isOneway) {
                blockObj.downAreaObj = downAreaObj;
                if (isOneway !== true) {
                    blockObj.downAreaObj.upAreaObj = blockObj;
                }
            },
            setUpAreaObj: function (upAreaObj, isOneway) {
                blockObj.upAreaObj = upAreaObj;
                if (isOneway !== true) {
                    blockObj.upAreaObj.downAreaObj = blockObj;
                }
            },
            move: {
                outEle: function () {
                    if (blockObj.CURR_ELE.hoverOut) {
                        blockObj.CURR_ELE.hoverOut();
                    }
                },
                reScroll: function (p) {
                    if (!blockObj.CURR_ELE) {
                        return false;
                    }
                    const rect = blockObj.CURR_ELE.getBoundingClientRect();
                    if (0) {
                        klBBLL.log('reScroll', {
                            CURR_ELE: blockObj.CURR_ELE,
                            top: rect.top,       // 元素顶部到视口顶部的距离
                            right: rect.right,   // 元素右侧到视口左侧的距离
                            bottom: rect.bottom, // 元素底部到视口顶部的距离
                            left: rect.left,     // 元素左侧到视口左侧的距离
                            width: rect.width,   // 元素宽度
                            height: rect.height  // 元素高度
                        });
                    }
                    if(blockObj.xyType===''){


                    }else{
                        if (rect.top < (240 + rect.height)) {
                            //  document.scrollingElement.scrollTop = document.scrollingElement.scrollTop - rect.top + 240;
                        }
                        if ((
                            rect.top >= 0 &&
                            rect.left >= 0 &&
                            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                        )) {
                            //  klBBLL.log('完全在显示区域内');
                        } else {
                            klBBLL.log('不在显示区域内',p,rect.top);
                            let wh = window.innerHeight;
                            let base_top = 400;
                            if (p === 1) {
                                document.scrollingElement.scrollTop = document.scrollingElement.scrollTop + rect.top;
                            } else if (p === -1) {
                                document.scrollingElement.scrollTop = document.scrollingElement.scrollTop + rect.top - wh + rect.height;
                            }
                        }
                    }





                },
                flushCurrentEleInfo: function (newCurrentEle) {
                    blockObj.init2DArray();
                    if (blockObj.y2x2ele_KV.length === 0) {

                    }
                    if (blockObj.CURR_ELE) {
                        blockObj.move.outEle();
                    }
                    if (newCurrentEle === 0) {
                        newCurrentEle = blockObj.eles[0] || false;
                    }
                    //newCurrentEle === undefined ||
                    if (blockObj.CURR_ELE && newCurrentEle && blockObj.CURR_ELE.klX === newCurrentEle.klX && blockObj.CURR_ELE.klY === newCurrentEle.klY) {
                        // return false;
                    }
                    let old = blockObj.CURR_ELE;
                    if (newCurrentEle) {
                        blockObj.CURR_ELE = newCurrentEle;
                    }

                    if (blockObj.CURR_ELE === false) {
                        if (blockObj.eles.length === 0) {
                            let err_msg = `当前 [${blockObj.title}] area没有ele`;
                            // alert(err_msg);
                            //   klBBLL.warn(err_msg, blockObj);
                            // throw err_msg;
                        } else {
                            blockObj.CURR_ELE = blockObj.eles[0] || false;
                        }
                    }
                    if (blockObj.CURR_ELE !== false) {
                        Object.values(document.getElementsByClassName('kl-hover')).forEach((ele) => {
                            ele.classList.remove('kl-hover');
                        });
                        if (blockObj.isVideoTool) {

                        } else {
                            blockObj.CURR_ELE.classList.add('kl-hover');
                        }

                        if (blockObj.CURR_ELE.hoverEnter) {
                            blockObj.CURR_ELE.hoverEnter();
                        }

                        //  klBBLL.warn(blockObj);
                        blockObj.CURR_ELE.YIndex = Array.prototype.indexOf.call(blockObj.tops, blockObj.CURR_ELE.klY);
                        //   klBBLL.log([blockObj.CURR_ELE.klY, blockObj.tops,   blockObj.CURR_ELE.YIndex]);
                        let lefts = Object.keys(blockObj.y2x2ele_KV[blockObj.CURR_ELE.klY]).map(v => parseInt(v)).sort((a, b) => {
                            return a - b;
                        });
                        blockObj.CURR_ELE.XIndex = Array.prototype.indexOf.call(lefts, blockObj.CURR_ELE.klX);

                        blockObj.CURR_ELE.hasRightIndex = (lefts.length - 1) > blockObj.CURR_ELE.XIndex;
                        blockObj.CURR_ELE.hasDownIndex = (blockObj.tops.length - 1) > blockObj.CURR_ELE.YIndex;
                        blockObj.CURR_ELE.hasLeftIndex = blockObj.CURR_ELE.XIndex > 0;
                        blockObj.CURR_ELE.hasUpIndex = blockObj.CURR_ELE.YIndex > 0;
                        const rect = blockObj.CURR_ELE.getBoundingClientRect();

                        if (newCurrentEle) {
                            klBBLL.log(`old:{  x:${old.klX} y:${old.klY} Yindex:${old.YIndex} Xindex:${old.XIndex} }`);
                            klBBLL.log(`new:{  x:${blockObj.CURR_ELE.klX} y:${blockObj.CURR_ELE.klY} Yindex:${blockObj.CURR_ELE.YIndex} Xindex:${blockObj.CURR_ELE.XIndex} }`, lefts);
                            klBBLL.log({
                                oldEle: old,
                                newEle: blockObj.CURR_ELE,
                                xxx: old === blockObj.CURR_ELE,
                            });
                        }

                    }
                },
                /**
                 * @param p 向量  -1 向上 1 向下
                 * @private
                 */
                _y: function (p) {
                    klBBLL.log(blockObj, blockObj.CURR_ELE.YIndex);
                    let hasNew = false;
                    let newYIndex = blockObj.CURR_ELE.YIndex + p;
                    if (blockObj.tops[newYIndex] === undefined) {
                        return '到头了';
                    }
                    let newY = blockObj.tops[newYIndex];
                    klBBLL.log(`old:{  x:${blockObj.CURR_ELE.klX} y:${blockObj.CURR_ELE.klY} Yindex:${blockObj.CURR_ELE.YIndex} }`);
                    klBBLL.log(newY, blockObj.y2x2ele_KV[newY], blockObj.y2x2ele_KV[newY][blockObj.CURR_ELE.klX]);
                    if (blockObj.y2x2ele_KV[newY] && blockObj.y2x2ele_KV[newY][blockObj.CURR_ELE.klX]) {

                        handle.move.flushCurrentEleInfo(blockObj.y2x2ele_KV[newY][blockObj.CURR_ELE.klX]);
                        hasNew = true;
                    } else {
                        klBBLL.log(';');
                        //如果情况不理想，就按最糟糕算
                        if (p === -1) {
                            hasNew = '上面到头了';
                            for (let i = newYIndex; i >= 0; i--) {
                                let newY2 = blockObj.tops[i];
                                let newYEles = Object.values(blockObj.y2x2ele_KV[newY2]);
                                if (newYEles.length > 0) {
                                    handle.move.flushCurrentEleInfo(newYEles[0]);
                                    hasNew = true;
                                    break;
                                }
                            }
                        } else if (p === 1) {
                            hasNew = '下面到头了';
                            for (let i = newYIndex; i < blockObj.tops.length; i++) {
                                let newY2 = blockObj.tops[i];
                                let newYEles = Object.values(blockObj.y2x2ele_KV[newY2]);
                                if (newYEles.length > 0) {
                                    handle.move.flushCurrentEleInfo(newYEles[0]);
                                    hasNew = true;
                                    break;
                                }
                            }
                        }
                    }
                    return hasNew;

                },
                _x: function (p) {
                    let lefts = Object.keys(blockObj.y2x2ele_KV[blockObj.CURR_ELE.klY]).map(v => parseInt(v)).sort((a, b) => {
                        return a - b;
                    });
                    let XIndex = Array.prototype.indexOf.call(lefts, blockObj.CURR_ELE.klX);
                    let newXIndex = XIndex + p;
                    if (lefts[newXIndex] === undefined) {
                        return '到头了';
                    }
                    let newX = lefts[newXIndex];

                    klBBLL.log(blockObj, blockObj.CURR_ELE.YIndex);
                    klBBLL.log(`old:{  x:${blockObj.CURR_ELE.klX} y:${blockObj.CURR_ELE.klY} Xindex:${XIndex} }`);

                    if (blockObj.y2x2ele_KV[blockObj.CURR_ELE.klY][newX]) {
                        handle.move.flushCurrentEleInfo(blockObj.y2x2ele_KV[blockObj.CURR_ELE.klY][newX]);
                        return true;
                    } else {
                        // 到头了，想干啥?
                        return `到头了，想干啥? ${blockObj.CURR_ELE.klY} newX: ${newX}`;
                    }

                },
                up: function () {
                    let res = handle.move._y(-1);
                    if (res !== true) {
                        klBBLL.warn('在搞什么Y飞机?', res);
                        if (blockObj.upAreaObj) {
                            blockObj.upAreaObj.enterArea(blockObj);
                        }
                    }
                    handle.move.reScroll(-1);
                },
                down: function () {
                    let res = handle.move._y(1);
                    if (res !== true) {
                        klBBLL.warn('在搞什么Y飞机?', res);
                        if (blockObj.downAreaObj) {
                            blockObj.downAreaObj.enterArea(blockObj);
                        } else if (blockObj.KeyCodeKV.ArrowDownFalse !== undefined) {
                            blockObj.KeyCodeKV.ArrowDownFalse();
                        }
                    }
                    handle.move.reScroll(1);

                },
                left: function () {
                    let res = handle.move._x(-1);
                    if (res !== true) {
                        klBBLL.warn('在搞什么X飞机?', res);
                        if (blockObj.leftAreaObj) {
                            blockObj.leftAreaObj.enterArea(blockObj);
                        }
                    }
                    handle.move.reScroll();
                },
                right: function () {
                    let res = handle.move._x(1);
                    if (res !== true) {
                        klBBLL.warn('在搞什么X飞机?', res, blockObj);
                        if (blockObj.rightAreaObj) {
                            blockObj.rightAreaObj.enterArea(blockObj);
                        }
                    }
                    handle.move.reScroll();
                },
                enter: function () {
                    klBBLL.log(klBBLL.CURR_AREA.CURR_ELE);
                    klBBLL.CURR_AREA.CURR_ELE.click();
                },
            }
        };

        blockObj = Object.assign(blockObj, handle);
        if (blockObj.isElesCountFixed === true) {
            blockObj.makeElesFuns[0](0);
        }
        blockObj.init2DArray();
        blockObj.move.flushCurrentEleInfo(0);
        return blockObj;
    },
    init: function () {
        window.klAssembly.log('初始化  BBLL ');
        window.klAssembly.log(document.body.getAttribute('class'));
        klBBLL.warn(window.localStorage.getItem('isKlTvDebug'), window.localStorage.getItem('isKlInCom'));
        klBBLL.debug(window.localStorage.getItem('isKlTvDebug') === 'true');
        klBBLL.setInCom(window.localStorage.getItem('isKlInCom') === 'true');

        document.body.classList.add('kl-body');

        klBBLL.lib.addMsg('start init');
        klBBLL.initAreaObj(klBBLL.areaKV.settingArea);
        klBBLL.lib.addMsg('init setting ok');

        klBBLL.areaKeys = Object.keys(klBBLL.areaKV);
        klBBLL.areaKeys.forEach((k) => {
            klBBLL.areaKV[k].areaKey = k;
            if (k.indexOf('video') === 0) {
                // klBBLL.areaKV[k].isVideoTool = true;
            }
        });

        window.setInterval(() => {
            klBBLL.markElements();
            if (klBBLL.CURR_AREA.CURR_ELE === false) {
                //  klBBLL.CURR_AREA.init2DArray();
                klBBLL.CURR_AREA.move.flushCurrentEleInfo();
            }
        }, 500);
        klBBLL.lib.addMsg('init interval ok ');


        klBBLL.PAGE_FLAG = document.location.pathname.split('/')[1] || '';
        if (document.location.search === '?tab=video') {
            klBBLL.PAGE_FLAG = 'subscribe_video';
        }
        klBBLL.log(`PAGE_FLAG: [${klBBLL.PAGE_FLAG}]`);
        klBBLL.lib.addMsg(`PAGE_FLAG: [${klBBLL.PAGE_FLAG}]`);
        switch (klBBLL.PAGE_FLAG) {
            //首页,[通用] + [推荐|热门|导航] + [幻灯片|列表]
            case '':
                klBBLL.initAreaObj(klBBLL.areaKV.rcmdVideoArea);
                klBBLL.areaKV.rcmdVideoArea.setUpAreaObj(klBBLL.areaKV.settingArea);
                //klBBLL.areaKV.rcmdVideoArea.enterArea(klBBLL.areaKV.settingArea);
                klBBLL.areaKV.rcmdVideoArea.enterArea();
                klBBLL.areaKV.settingArea.setUpAreaObj(klBBLL.areaKV.rcmdVideoArea, true);

                break;
            //播放页
            case 'video':
                klBBLL.areaKV.videoEmptyArea.isInitedArea = true;
                klBBLL.initAreaObj(klBBLL.areaKV.videoEmptyArea);
                klBBLL.areaKV.videoEmptyArea.enterArea();

                klBBLL.areaKV.videoOptionArea.isInitedArea = true;
                klBBLL.initAreaObj(klBBLL.areaKV.videoOptionArea);
                klBBLL.areaKV.videoOptionArea.setLeftAreaObj(klBBLL.areaKV.videoEmptyArea, true);
                klBBLL.areaKV.videoOptionArea.setUpAreaObj(klBBLL.areaKV.videoEmptyArea, true);


                klBBLL.initAreaObj(klBBLL.areaKV.videoEplistArea);
                klBBLL.areaKV.videoEplistArea.setLeftAreaObj(klBBLL.areaKV.videoOptionArea);
                klBBLL.areaKV.videoEplistArea.setUpAreaObj(klBBLL.areaKV.videoOptionArea, true);

                klBBLL.initAreaObj(klBBLL.areaKV.videoRcmdListArea);
                klBBLL.areaKV.videoRcmdListArea.setLeftAreaObj(klBBLL.areaKV.videoEplistArea);
                klBBLL.areaKV.videoRcmdListArea.setUpAreaObj(klBBLL.areaKV.videoOptionArea, true);


                /*
                klBBLL.warn('直接全屏弃疗');
                document.querySelector('video').requestFullscreen();
                setTimeout(() => {
                    klBBLL.warn('直接全屏弃疗1');
                    document.querySelector('video').requestFullscreen();
                    document.getElementsByClassName('bpx-player-ctrl-btn bpx-player-ctrl-full')[0].click();

                }, 5000);
                */


                break;

            case 'subscribe_video':
                klBBLL.initAreaObj(klBBLL.areaKV.subscribeVideoArea);
                klBBLL.areaKV.subscribeVideoArea.setUpAreaObj(klBBLL.areaKV.settingArea);
                klBBLL.areaKV.subscribeVideoArea.enterArea();
                klBBLL.areaKV.settingArea.setUpAreaObj(klBBLL.areaKV.subscribeVideoArea, true);

                break;
            case 'history':
                klBBLL.initAreaObj(klBBLL.areaKV.historyArea);
                klBBLL.areaKV.historyArea.setUpAreaObj(klBBLL.areaKV.settingArea);
                klBBLL.areaKV.historyArea.enterArea();
                klBBLL.areaKV.settingArea.setUpAreaObj(klBBLL.areaKV.historyArea, true);

                break;
            default:
                klBBLL.initAreaObj(klBBLL.areaKV.DefaultArea);
                klBBLL.areaKV.DefaultArea.setUpAreaObj(klBBLL.areaKV.settingArea);
                klBBLL.areaKV.DefaultArea.enterArea();
                klBBLL.areaKV.settingArea.setUpAreaObj(klBBLL.areaKV.DefaultArea, true);

                break;
        }
        klBBLL.lib.addMsg('init bizArea ok ');

        document.body.addEventListener('keydown', function (e) {
            let keyCode = e.key;
            let ctrlKey = e.ctrlKey;
            let shiftKey = e.shiftKey;
            klBBLL.log("\n\n\n", `${keyCode} ctrl ${ctrlKey} shift: ${shiftKey}  ${e.key} ${e.code} ${e.keyCode} ${e.which}`, e);
            if (klBBLL.CURR_AREA.KeyCodeKV[keyCode] === undefined || klBBLL.CURR_AREA.KeyCodeKV[keyCode] === false) {
                //什么都不干，让默认事件来
            } else if (klBBLL.CURR_AREA.KeyCodeKV[keyCode] === true) {
                switch (keyCode) {
                    case 'ArrowUp':
                        klBBLL.CURR_AREA.move.up();
                        break;
                    case 'ArrowDown':
                        klBBLL.CURR_AREA.move.down();
                        break;
                    case 'ArrowLeft':
                        klBBLL.CURR_AREA.move.left();
                        break;
                    case 'ArrowRight':
                        klBBLL.CURR_AREA.move.right();
                        break;
                    case 'Enter':
                        klBBLL.CURR_AREA.move.enter();
                        break;
                    case 'Escape'://27
                        klBBLL.log(`[${klBBLL.PAGE_FLAG}]`);
                        if (klBBLL.PAGE_FLAG === 'video') {
                            window.close();
                        }
                        break;
                }
                e.preventDefault();
                e.stopPropagation();

            } else {
                e.preventDefault();
                e.stopPropagation();
                if (klBBLL.CURR_AREA.KeyCodeKV[keyCode]() !== true) {

                }
            }


            if (ctrlKey && shiftKey && keyCode === 'S') {

            }
        });
        document.addEventListener('contextmenu', function (e) {
            if (klBBLL.IS_DEBUG === false) {
                console.warn('阻止 contextmenu');
                klBBLL.lib.keyInput('ContextMenu');
                e.preventDefault();
                e.stopPropagation();
            }
        });
        klBBLL.lib.addMsg('add keydown event listener ok ');

        klBBLL.removeOthers();
        klBBLL.lib.addMsg('remove others ok ');

        klBBLL.markElements();
        klBBLL.lib.addMsg('1st time markElements ok ');

    },
    removeOthers: function () {
        // return false;
        let xpathPartStrs = [];
        //这几个删除会导致白屏检查
        xpathPartStrs = [
            `.//div[contains(@class,'header-channel')]`,//频道导航条
            `.//div[contains(@class,'recommended-swipe')]`,//推荐滚动幻灯片
            `.//div[contains(@class,'bili-header__bar')]`,//头像那个 浮动条
            `.//div[contains(@class,'bili-header__banner')]`,//头部背景
        ];
        //x 删除这些不必要得视频，也会触发白屏 一个首页拉了两页就1000M内存也是神人
        xpathPartStrs = [`.//div[contains(@class,'v-inline-player')]`];
        xpathPartStrs = [];
        //recommended-swipe grid-anchor
        xpathPartStrs.forEach(xpathPartStr => {
            Object.values(kl.xpathSearch(`.//div[${xpathPartStr}]`)).forEach(tmpEle => {
                //tmpEle.remove();//删除会有概率触发白屏检查
                tmpEle.setStyle({display: 'none'}).removeAllChildNodes();
            });
        });

        klBBLL.warn('开始隐藏');
        let as = [];
        let hrefs = [];
        let hiddenClassKws = ['header-channel', 'bili-header'];
        hiddenClassKws.forEach(kw => {
            Object.values(document.getElementsByClassName(kw)).forEach(tmpEle => {
                tmpEle.classList.add('hide');
                Object.values(kl.xpathSearch('.//a', tmpEle)).forEach(a2 => {
                    if (hrefs.indexOf(a2.href) === -1) {
                        hrefs.push(a2.href);
                        as.push({href: a2.href, text: a2.textContent.trim()});
                    }
                });
            });
        });
        window.localStorage.setItem('kl-channel-link-infos', JSON.stringify(as));
        klBBLL.log(as);

    },
    markElements: () => {

        //for of & Object.keys 都会有概率造成乱序    klBBLL.areaKV
        // ['settingArea', 'rcmdVideoArea', 'videoPlayerArea'].
        klBBLL.areaKeys.forEach(blockKey => {
            if (klBBLL.areaKV[blockKey].isInitedArea === true) {
                let tmpCnt = klBBLL.areaKV[blockKey].eles.length;
                klBBLL.areaKV[blockKey].makeElesFuns.forEach((markFun, tmp_i) => {
                    if (markFun !== false) {
                        try {
                            let tmpEles = markFun(tmp_i);
                            if (Array.isArray(tmpEles) && tmpEles.length > 0) {
                                klBBLL.areaKV[blockKey].eles = klBBLL.areaKV[blockKey].eles.concat(tmpEles);
                            }
                        } catch (e) {
                            klBBLL.error(`markFun error:${blockKey}  ${tmp_i}`, markFun, e.message);
                        }
                    }
                });
                if (tmpCnt !== klBBLL.areaKV[blockKey].eles.length) {
                    // klBBLL.areaKV[blockKey].init2DArray(); 这会导致 bilibili 解析失败？
                }
            }
        });


    },


};
window.klAssembly.isNeedBaseLib = false;
window.klAssembly = Object.assign(window.klAssembly,
    {
        BBLL: klBBLL,
    });

klBBLL.log('KL_BBLL loaded');

if (top === window) {

    klBBLL.init();
    //window.klAssembly.showOpts();
}






//  /data/codes/advanced/frontend/web/static/js/tampermonkey/bilibili/index.js <--
//end