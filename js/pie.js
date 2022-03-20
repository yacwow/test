(function () {
    var pie = {
        init() {
            this.getData();
            this.option = {
                title: {
                    text: '',
                    subtext: 'randomCreated',
                    left:'center'
                },
                legend: {
                    data: [],
                    orient:'vertical',
                    left:'left'
                },
                series: {
                    name: '',
                    type: 'pie',
                    data: [],
                    radius:'55%',
                    center:['50%', '60%'],
                    itemStyle:{
                        emphasis:{
                            shadowBlur:10,
                            shadowColor:'rgba(0,255,0,1)'
                        }
                    }
                }
            }
        },
        getData() {
            var This = this;
            $.ajax({
                url: '/getAllData',
                success: function (res) {
                    console.log(res);
                    var list = JSON.parse(res);
                    // console.log(list);
                    console.log(typeof(res))
                    if (list.length > 0) {
                        This.areaChart(list);
                        This.sexChart(list);
                    } else {
                        alert('No Data,please input');
                    }
                }
            })
        },
        areaChart(data) {
            var myChart = echarts.init(document.querySelector('.areaChart'));

            var legendData = [];
            var seriesData = [];


            /*
                legendData =>  ['华北','华南',...]
                seriesData => [{name: '华北', value: 2}, {name: '华南', value: 5}]

                newData => {'华北':2, '华南':5}
             */

            var newData = {};
            data.forEach(function (item) {
                console.log(item.add);
                if (!newData[item.add]) { 
                    newData[item.add] = 1;
                    legendData.push(item.add);
                } else {
                    newData[item.add]++;
                }
            });

            console.log(newData);
            for (var prop in newData) {
                seriesData.push({
                    name: prop,
                    value: newData[prop]
                });
            }
            console.log(seriesData);

            // console.log(seriesData)
            this.option.title.text = 'student category by region';
            this.option.legend.data = legendData;
            this.option.series.name = 'region distribution';
            this.option.series.data = seriesData;
            myChart.setOption(this.option);
        },
        sexChart(data) {
            console.log(data);
            var myChart = echarts.init(document.querySelector('.sexChart'));

            var legendData = ['male', 'female'];

            var newData = {};
            data.forEach(function (item) {
                if (!newData[item.sex]) { 
                    newData[item.sex] = 1;
                } else {
                    newData[item.sex]++;
                }
            });
            console.log(newData);
            var seriesData = [
                { name: 'male', value: newData['male'] },
                { name: 'female', value: newData['female'] }
            ];
            console.log(seriesData);
            this.option.title.text = 'student category by sex';
            this.option.legend.data = legendData;
            this.option.series.name = 'sex distribution';
            this.option.series.data = seriesData;
            myChart.setOption(this.option);
        }
    }

    pie.init();
})();