var students = [],    //storage all student info
    editId = 0,   //current edit student'sid
    cn = 1,   //current page
    tn = 0,   //total page
    mn = 7;   //maximum showed page for turn page

//left menu
$('#menu li').click(function () {
    tab($(this).index());   //index=click dom index
    $(this).index()==1 && clearForm();  //when we click add student, we need to clear 
})
//select
function tab(n) {
    $('#menu li').eq(n).addClass('active').siblings().removeClass('active');
    $('#content > div').eq(n).addClass('active').siblings().removeClass('active');
}

//initial
function init() {
    if (localStorage.students) {   
        students = JSON.parse(localStorage.students);  
        tn = Math.ceil(students.length / 10);   

        renderList();   //render student list
    } else { //if there is no data, we automatically create 5 students
        createDefaultData();
    }
}
init();

//if there is no data, we automatically create 5 students
function createDefaultData() {
    $.ajax({
        url: '/getDefaultData',
        dataType: 'json',
        success: function (res) {
            //console.log(res);
            localStorage.students = JSON.stringify(res.data); 
            students = res.data;  //storage in the student list
            tn = Math.ceil(students.length / 10);   

            renderList();  
        }
    })
}

//render student list
function renderList() {
    renderTable();  //render all the data

    $('#page').page({
        cn,
        tn,
        mn,
        callBack: function (n) {
            cn = n;   //when we click we give the click number to current number
            renderTable();
        }
    });
}

function renderTable() {

    var arr = students.slice((cn - 1) * 10, cn * 10);   //each page for 10 students

    var thead = `<thead>
        <tr>
            <th>学号</th>
            <th>姓名</th>
            <th>性别</th>
            <th>邮箱</th>
            <th>年龄</th>
            <th>手机号</th>
            <th>住址</th>
            <th>操作</th>
        </tr>
    </thead>`;

    var tr = arr.map(function (item) {
        return `<tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.sex}</td>
                <td>${item.email}</td>
                <td>${item.age}</td>
                <td>${item.tel}</td>
                <td>${item.add}</td>
                <td>
                    <button data-id=${item.id} class="editBtn btnBg1">edit</button>
                    <button data-id=${item.id} class="delBtn btnBg2">dele</button>
                </td>
            </tr>`
    }).join('');

    //add dom
    $('.studentTable').html(`<table>${thead}<tbody>${tr}</tbody></table>`);
}

//random create data
$('#randomAdd').click(function () {
    $.ajax({
        url: '/randomAdd',
        dataType: 'json',
        success: function (res) {
            // console.log(res);
            students.push(res); 
            localStorage.students = JSON.stringify(students); 
            tn = Math.ceil(students.length / 10);
            cn = tn;  

            renderList();   
        }
    })
});


//customize add
$('#customAdd').click(function () {
    tab(1);
    clearForm();
});

//search function
$('#searchBtn').click(function () {
    var select = $('.searchBox select').val();    //which type we use to search
    var word = $('.searchBox input').val();   //the value we use to search

    if (!word) {
        alert('please enter your search content');
        return;
    }

    //search 
    $.ajax({
        url: '/search',
        type: 'post',
        dataType: 'json',
        data: {  
            select,
            word
        },
        success: function (res) {
            //console.log(res);
            if (res.length) {
                
                students = res;
                tn = Math.ceil(students.length / 10);
                cn = 1;   //we need to render the data to first page;
                renderList();
            } else {
                $('.studentTable').html('we can not find the student');
                $('#page').html('');
            }
        }
    })
});

//show the default data when we click back
$('#backBtn').click(function () {
    $('.searchBox input').val('');  
    students = JSON.parse(localStorage.students);
    tn = Math.ceil(students.length / 10);
    cn = 1;
    renderList();
});


//valid data
$('#name').blur(function () {
    if (!$(this).val()) { 
        $('#validateName').html('* please input your name');
        return;
    }

    $('#validateName').html('');
});

$('#email').blur(function () { 
    if (!$(this).val()) { 
        $('#validateEmail').html('* please input your email');
        return;
    }

    if (!/^[\w\.-]+@[\w-]+\.[a-z]+$/.test($(this).val())) {
        $('#validateEmail').html('* invalid format');
        return;
    }

    $('#validateEmail').html('');
});

$('#age').blur(function () { 
    if (!$(this).val()) { 
        $('#validateAge').html('* please enter your age');
        return;
    }

    if (isNaN($(this).val())) {   
        $('#validateAge').html('* invalid format');
        return;
    }

    if ($(this).val() <= 0 || $(this).val() > 100) {
        $('#validateAge').html('* invalid format');
        return;
    }

    $('#validateAge').html('');
});

//edit
$('.studentTable').on('click', '.editBtn', function () {
    tab(1); 

    $.ajax({
        url: '/getStudentInfo',
        type: 'post',
        dataType: 'json',
        data: {
            id: this.dataset.id
        },
        success: function (res) {
            console.log(res);

            $('#name').val(res[0].name);
            $('#email').val(res[0].email);
            $('#age').val(res[0].age);
            $('#tel').val(res[0].tel);
            $('#address').val(res[0].add);

            if (res[0].sex == 'male') {
                $('#male').prop('checked', true);
                $('#female').prop('checked', false);
            } else {
                $('#male').prop('checked', false);
                $('#female').prop('checked', true);
            }

            editId = res[0].id;
            $('#addForm .submitBtn').text('confirm');
        }
    });
});

//提交学生（修改或者新增）
$('#addForm .submitBtn').click(function () {
    var arr = $('#addForm').serializeArray(); 
    //console.log(arr);

    //make sure all data is good
    var hasValue = arr.every(function (item) {  
        return item.value != ''; 
    });

    //valid the fill
    var isValidate = $('.regValidate').toArray().every(function (item) {   
        return $(item).html() == '';
    });

    if (!hasValue) {
        alert('please fill every line');
        return;
    }
    if (!isValidate) {
        alert('please make sure every line meet request');
        return;
    }

    var newData = { 
        name: arr[0].value,
        sex: arr[1].value,
        email: arr[2].value,
        age: arr[3].value,
        tel: arr[4].value,
        add: arr[5].value,
    }

    if ($(this).text() == 'submit') { //增加一条新数据
        $.ajax({
            url: '/customAdd',
            type: 'post',
            dataType: 'json',
            data: newData,
            success: function (res) {
                // console.log(res);
                students.push(res); //把数据放到变量里
                localStorage.students = JSON.stringify(students); //把新数据存储到本地
                tn = Math.ceil(students.length / 10);
                cn = tn;  //页码显示到最后一页

                renderList();   //渲染学生列表
                tab(0); //页面跳转到学生列表
            }
        });
    } 
    // else {  //修改数据 
    //     newData.id=editId;  //给数据增加一个id
    //     $.ajax({
    //         url: '/edit',
    //         type: 'post',
    //         dataType: 'json',
    //         data: newData,
    //         success: function (res) {
    //             console.log(res);
    //             students=res; //把数据放到变量里
    //             localStorage.students = JSON.stringify(students); //把新数据存储到本地

    //             clearForm();
    //             renderList();   //渲染学生列表
    //             tab(0); //页面跳转到学生列表
    //         }
    //     });
    // }
});

//clear form
function clearForm(){
    $('#addForm')[0].reset();
    $('#addForm .submitBtn').text('submit');
    $('.regValidate').html('');
}

$('.returnBtn').click(function(){
    tab(0);
});

//delete
$('.studentTable').on('click', '.delBtn', function () {
    var id=this.dataset.id;
    if(confirm('delete the student?')){
        $.ajax({
            url: `/del/${id}`,
            type: 'delete',
            dataType: 'json',
            success: function (res) {
                
                students=res; 
                localStorage.students = JSON.stringify(students); 
                tn=Math.ceil(students.length/10);   
                if(cn>tn){  //if we del too much maybe page change;
                    cn=tn;
                }

                renderList();  
                tab(0); 
            }
        });
    }
});




