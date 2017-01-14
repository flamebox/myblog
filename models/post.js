/**
 * Created by flamebox on 2016/4/29.
 */
var mongodb = require('./db');
var markdown = require('markdown').markdown;

function Post(name, title, post) {
    this.name = name;
    this.title = title;
    this.post = post;
}

module.exports = Post;

Post.prototype.save = function (callbak) {
    var date = new Date();
    //存放各种时间格式
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + "-" + (date.getMonth() + 1),
        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" +
        date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' +
        date.getMinutes() : date.getMinutes())
    }
    //存放数据库的文档
    var post = {
        name: this.name,
        time: time,
        title: this.title,
        post: this.post,
        comments: []    //数组形式
    }
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callbak(err);
        }
        //读取posts集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callbak(err);
            }
            //将文档插入到 posts 集合
            collection.insert(post, {
                safe: true
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callbak(err)
                }
                callbak(null);  //返回err 为 null
            });
        });
    });
};

//从数据库读取文章及相关信息
Post.getAll = function (name, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {         //应该是将name转换成bson对象
                query.name = name;
            }
            //根据query对象查询文章
            collection.find(query).sort({time: -1}).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                //解析 markdown 为html
                //docs.forEach(function (doc) {
                //    doc.post = markdown.toHTML(doc.post);
                //});
                callback(null, docs);    //读取成功，以数组形式返回查询结果
            });
        });
    });
};
//获取一篇文章
Post.getOne = function (name, day, title, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据用户名\发表日期\文章名检索文章
            collection.findOne({
                "name": name,
                "time.day": day,
                "title": title
            }, function (err, doc) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                //解析markdown 为html
                //if (doc) {
                //    doc.post = markdown.toHTML(doc.post);
                //    if (doc.comments) {
                //        doc.comments.forEach(function (comment) {
                //            comment.content = markdown.toHTML(comment.content);
                //        });
                //    }
                //}
                callback(null, doc);    //返回成功查询出的一篇文章
            });
        });
    });
};

//返回发表内容
Post.edit = function (name, day, title, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "name": name,
                "time.day": day,
                "title": title
            }, function (err, doc) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, doc); //返回查询到的一篇文章
            });
        });
    });
};

//更新一遍文章及相关信息
Post.update = function (name, day, title, post, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({
                "name": name,
                "time.day": day,
                "title": title
            }, {
                $set: {post: post}
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null); //保存成功
            });
        });
    });
};

//删除一篇文章
Post.remove = function (name, day, title, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.remove({
                "name": name,
                "time.day": day,
                "title": title
            }, {
                w: 1
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null); //删除成功
            });
        });
    });
};