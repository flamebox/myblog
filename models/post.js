/**
 * Created by flamebox on 2016/4/29.
 */
var mongodb = require('./db');

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
        post: this.post
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
Post.get = function (name, callback) {
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
                callback(null, docs);    //读取成功，以数组形式返回查询结果
            });
        });
    });
};