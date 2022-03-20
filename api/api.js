//data template
var template = {
    'id|+1': 1,
    'name': '@name',
    'sex|1': ['male', 'female'],
    'email': '@email',
    'age|20-30': 1,
    'tel': /^1[3578][1-9]\d{8}/,
    'add': '@region'
};

//random create default data
Mock.mock('/getDefaultData', {
    status: 'success',
    msg: 'request success',
    'data|5': [template]
});

//random create one data
Mock.mock('/randomAdd', function () {
    var newData = Mock.mock(template);

    var students = JSON.parse(localStorage.students); //get local storage data
    newData.id = parseInt(students[students.length - 1].id) + 1;  //create new id last id+1

    return newData;
});

//url string to obj
function queryToObj(str) {
    var result = {};
    var url = new URL('http://www.kaivon.cn/?' + str);
    //console.log(url);

    for (param of url.searchParams) { 
        //console.log(param);
        result[param[0]] = param[1];
    }
    return result;
}
//for echarts 
Mock.mock('/getAllData',function(){
    return JSON.parse(localStorage.students);
})
//search
Mock.mock('/search', 'post', function (options) {
    //console.log(options.body);   //select=name&word=%E5%BD%AD%E5%A8%9F    （encodeURIComponent）
    var searchInfo = queryToObj(options.body);    //{select:'name', word:'kevin'}
    var students = JSON.parse(localStorage.students); 

    switch (searchInfo.select) {//search by different type
        case "id":  
            return students.filter(function (item) { //filter all data,id==id in data
                return item.id == searchInfo.word;
            });          
        case "name":
            return students.filter(function (item) { 
                return item.name.indexOf(searchInfo.word) != -1;  //one word is acceptable
            });
        case "sex":
            return students.filter(function (item) { 
                return item.sex == searchInfo.word;  
            });
    }
});


//edit
Mock.mock('/getStudentInfo', 'post', function (options) {
    var id = queryToObj(options.body).id;

    var students = JSON.parse(localStorage.students);
    return students.filter(function (item) {
        return item.id == id;
    });
});

//customize add
Mock.mock('/customAdd', 'post', function (options) {
    var newData = queryToObj(options.body);

    var students = JSON.parse(localStorage.students); 
    newData.id = parseInt(students[students.length - 1].id) + 1;  

    return newData;
});

//edit student
Mock.mock('/edit', 'post', function (options) {
    var newData = queryToObj(options.body);

    var students = JSON.parse(localStorage.students); 

    var index=students.findIndex(function (item){ //find all request index
        return item.id == newData.id;
    });
    students.splice(index, 1, newData); //use new index to replace

    return students;
});

//del student
Mock.mock(new RegExp('/del/\d*'), 'delete', function (options) {
    var id = options.url.split('/')[2];

    var students = JSON.parse(localStorage.students); //get local storage

    var index=students.findIndex(function (item){ 
        return item.id == id;
    });
    students.splice(index, 1); 

    return students;
});
