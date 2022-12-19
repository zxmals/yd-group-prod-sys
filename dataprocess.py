#!/usr/local/bin/python3

from datetime import *
import mysql.connector as connector
from hashlib import md5
import csv

connection = connector.connect(
        host='10.237.96.215',
        user='grp',
        passwd='cmcc$#21',
        db='grp_product',
        charset='utf8'
)
cur = connection.cursor()

# insert data into table witem
sql = "insert into witem values(%s,%s,%s,%s,%s,%s,%s)"
with open("wait_item_{}.csv".format(str(date.today()+timedelta(days=-1)).replace('-','')),'r',encoding='utf-8',errors='ignore') as f:
        fc = csv.reader(f,delimiter='$')
        cnt=0
        for row in fc:
                print(row)
                if cnt != 0:
                        try:
                                cur.execute(sql,(row[0],row[1],row[2],row[3],row[4],row[5],date.today(),))
                                connection.commit()
                                cnt += cur.rowcount
                        except OSError as reason:
                                print(reason)
                cnt += 1 if cnt==0 else 0
        print("witem:insert {} rows.".format(cnt-1))

# sql = "delete from witem where op_date <= %s"
# cur.execute(sql,((date.today()+timedelta(days=-2)),))
# connection.commit()


# # insert data into table product
# sql = "insert into product (offer_id,offer_name,eff_date,exp_date,biz_code,online_stat,op_date) values(%s,%s,%s,%s,%s,%s,%s)"
# with open("./grp_datas/aaaa_b1_{}.csv".format(str(date.today()).replace('-','')),'r',encoding='utf-8',errors='ignore') as f:
#         fc = csv.reader(f)
#         cnt=0
#         for row in fc:
#                 if cnt != 0:
#                         try:
#                                 cur.execute(sql,(row[1],row[2],row[3],row[4],row[5],1,date.today(),))
#                                 connection.commit()
#                                 cnt += cur.rowcount
#                         except OSError as reason:
#                                 print(reason)
#                 cnt += 1 if cnt==0 else 0
#         print("product:insert {} rows.".format(cnt-1))

# sql = "delete from product where op_date <= %s"
# cur.execute(sql,((date.today()+timedelta(days=-2)),))
# connection.commit()


# sql = '''
# insert into product
# select a.offer_id,a.offer_name,a.eff_date,a.exp_date,a.biz_code,a.product_desc,a.product_fee,a.product_man,a.product_process,0,%s
# from (select * from product  where op_date = %s )a
# left join (select * from product  where op_date = %s )b on a.offer_id=b.offer_id
# where b.offer_id is null
# '''
# cur.execute(sql,(date.today(),(date.today()+timedelta(days=-1)),date.today(),))
# connection.commit()

# # insert data into table product_item
# sql = "insert into product_item values(%s,%s,%s,%s)"
# with open("./grp_datas/aaaa_b2_{}.csv".format(str(date.today()).replace('-','')),'r',encoding='utf-8',errors='ignore') as f:
#         fc = csv.reader(f)
#         cnt=0
#         for row in fc:
#                 if cnt != 0:
#                         try:
#                                 cur.execute(sql,(row[0],row[1],row[2],date.today(),))
#                                 connection.commit()
#                                 cnt += cur.rowcount
#                         except OSError as reason:
#                                 print(reason)
#                 cnt += 1 if cnt==0 else 0
#         print("product_item:insert {} rows.".format(cnt-1))

# sql = "delete from product_item where op_date <= %s"
# cur.execute(sql,((date.today()+timedelta(days=-2)),))
# connection.commit()

# sql = '''
# insert into product_item
# select a.offer_id,a.item_id,a.item_name,%s
# from (select * from product_item where op_date=%s)a
# left join (select * from product_item where op_date=%s)b on a.offer_id = b.offer_id
# where b.offer_id is null
# '''
# cur.execute(sql,(date.today(),(date.today()+timedelta(days=-1)),date.today(),))
# connection.commit()


# # insert data into table ent_product_ctg
# sql = "insert into ent_product_ctg values(%s,%s,%s,%s,%s,%s)"
# with open("./grp_datas/aaaa_b4_{}.csv".format(str(date.today()).replace('-','')),'r',encoding='utf-8',errors='ignore') as f:
#         fc = csv.reader(f)
#         cnt=0
#         for row in fc:
#                 if cnt != 0:
#                         try:
#                                 cur.execute(sql,(row[0],row[1],row[2],row[3],row[4],date.today(),))
#                                 connection.commit()
#                                 cnt += cur.rowcount
#                         except OSError as reason:
#                                 print(reason)
#                 cnt += 1 if cnt==0 else 0
#         print("ent_product_ctg:insert {} rows.".format(cnt-1))

# sql = "delete from ent_product_ctg where op_date <= %s"
# cur.execute(sql,((date.today()+timedelta(days=-2)),))
# connection.commit()

# sql = "update ent_product_ctg set biz_code = null where biz_code = ''"
# cur.execute(sql)
# connection.commit()

# sql = 'drop table if exists ent_product_ctg_zx'
# cur.execute(sql)
# connection.commit()

# sql = "select max(op_time)op_time from ent_product_ctg where op_date=%s "
# cur.execute(sql,((date.today()+timedelta(days=-1)),))
# res = cur.fetchone()
# max_date = res[0]

# sql = '''
# create table grp_product.ent_product_ctg_zx as
# select * from (
#         select distinct
#         a.catg_id catg_id1,a.catg_name catg_name1,
#         b.catg_id catg_id2,b.catg_name catg_name2,b.parent_id parent_id1,
#         c.catg_id catg_id3,c.catg_name catg_name3,c.parent_id parent_id2,
#         d.catg_id catg_id4,d.catg_name catg_name4,d.parent_id parent_id3,
#         e.catg_id catg_id5,e.catg_name catg_name5,e.parent_id parent_id4,
#         COALESCE(a.biz_code,b.biz_code,c.biz_code,d.biz_code,e.biz_code)biz_code,%s op_date
#         from (SELECT catg_id,catg_name,biz_code FROM `ent_product_ctg` where parent_id = '0' and op_time=%s and op_date=%s) a
#         left join (SELECT catg_id,catg_name,parent_id,biz_code FROM `ent_product_ctg` where op_time=%s and op_date=%s )b on a.catg_id = b.parent_id
#                                          left join (SELECT catg_id,catg_name,parent_id,biz_code FROM `ent_product_ctg` where op_time=%s and op_date=%s )c on b.catg_id = c.parent_id
#                                          left join (SELECT catg_id,catg_name,parent_id,biz_code FROM `ent_product_ctg` where op_time=%s and op_date=%s )d on c.catg_id = d.parent_id
#                                          left join (SELECT catg_id,catg_name,parent_id,biz_code FROM `ent_product_ctg` where op_time=%s and op_date=%s )e on d.catg_id = e.parent_id
# )a where biz_code is not null order by catg_id1,catg_id2,catg_id3,catg_id4,catg_id5,biz_code
# '''
# ld = date.today()+timedelta(days=-1)
# cur.execute(sql,(ld,max_date,ld,max_date,ld,max_date,ld,max_date,ld,max_date,ld,))

cur.close()
connection.close()
