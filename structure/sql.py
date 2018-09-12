#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import yaml
import sys
import argparse
reload(sys)
sys.setdefaultencoding('utf8')

if __name__ == '__main__':
    levelArray = ["site", "organization", "project", "user"]
    baseDirs = os.path.abspath(os.path.join(os.path.dirname("__file__")))
    wholeConfig = '{baseDirs}/config.yml'.format(baseDirs=baseDirs);
    ymlFile = open(wholeConfig)
    contentConfig = yaml.load(ymlFile)

    parser = argparse.ArgumentParser()
    parser.add_argument('-i','--ip', help='databse host', dest="host", default="localhost")
    parser.add_argument('-p','--port', type=int, help='databse port', dest="port", default=3306)
    parser.add_argument('-u','--user', help='databse user', dest="user", default="choerodon")
    parser.add_argument('-s','--secret', help='databse password', dest="passwd", default="123456")
    parser.add_argument('-a','--attrs', help='enable update attrs, it can include sort & parent_id, you can use "port,parent_id" to update menu attrs', dest="attrs", default="")
    parser.add_argument('-d','--delete', type=bool, help='enable delete menu', dest="delete", default=False)
    parser.add_argument('-t','--type', help='mysql/oracle', dest="dbType", default="mysql")
    args = parser.parse_args()

    host = os.environ.get('DB_HOST') if os.environ.get('DB_HOST') else args.host
    port = os.environ.get('DB_PORT') if os.environ.get('DB_PORT') else args.port
    user = os.environ.get('DB_USER') if os.environ.get('DB_USER') else args.user
    passwd = os.environ.get('DB_PASS') if os.environ.get('DB_PASS') else args.passwd
    attrs = os.environ.get('UP_ATTRS') if os.environ.get('UP_ATTRS') else args.attrs
    delete = os.environ.get('ENABLE_DELETE') if os.environ.get('ENABLE_DELETE') else args.delete
    dbType = os.environ.get('DB_TYPE') if os.environ.get('DB_TYPE') else args.dbType

    if dbType == "mysql":
        config = {
            'host': host,
            'port': int(port),
            'user': user,
            'passwd': passwd
        }
        operate = __import__('menu.menuMysql')
        menuOperate = operate.MenuMysql(config, os.getenv("DB_NAME", "iam_service"), attrs)
    elif dbType == "oracle":
        config = {
            'host': host,
            'port': int(port),
            'user': user,
            'password': passwd,
            'sid':'xe'
        }
        operate = __import__('menu.menuOracle')
        menuOperate = operate.MenuOracle(config, os.getenv("DB_NAME", "iam_service"), attrs)
    
    menuOperate.insertMenuTable('IAM_MENU', contentConfig)
    menuOperate.insertMenuTlTable('IAM_MENU_TL', contentConfig)
    menuOperate.insertServiceTlTable('IAM_MENU_TL', contentConfig)
    menuOperate.insertMenuPermission('IAM_MENU_PERMISSION', contentConfig)
    if delete == True:
        menuOperate.deleteMenu(contentConfig)
    ymlFile.close()