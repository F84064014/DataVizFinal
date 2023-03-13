import {columnItems} from './option.js';

export class DataLoader {
  
  /* input and clean data */
  constructor(data) {
    this.data = data;
    this.clean();
  }

  /* clean data */
  clean() {

    this.data.forEach(d=>{

      const targetColumns = columnItems;

      // 缺失值給予0
      targetColumns.forEach(tc=>{
        // if ((d[tc] === "-") || (isNaN(d[tc]) )) {d[tc] = 0;}
        if (d[tc] === "-") {d[tc] = 0;}
        d[tc] = +d[tc];
      });

      // 只使用繁體字 "臺" (避免與地圖資訊不合)
      if (d["地區別"].includes("台")) {d["地區別"] = d["地區別"].replace("台", "臺")}
      if (d["地區別"] == "桃園縣") {d["地區別"] = "桃園市";} //2014年以前是桃園市
    });

    // 移除台灣省、福建省資料
    this.data = this.data.filter(d=>{
      return (d["地區別"] != "臺灣省") && (d["地區別"] != "福建省");
    })
    
  }
  
  /* get data */
  get(year=null, fruit=null, county=null) {
    
    if (!year && !fruit && !county) {return this.data;}
    
    const yearF = year? (d=>{return d["年度"] == year}) : (d=>true)
    const fruitF = fruit? (d=>{return d["果品類別"] == fruit}) : (d=>true)
    const countyF =