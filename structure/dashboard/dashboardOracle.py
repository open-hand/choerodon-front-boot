#!/usr/bin/env python
# -*- coding: utf-8 -*-
import cx_Oracle
import os
import json
import logging
from Dashboard import Dashboard

class DashboardOracle(Dashboard):
    db = {}
    cursor = {}
    def __init__(self, config, schema, debug):
        os.environ['NLS_LANG'] = 'SIMPLIFIED CHINESE_CHINA.UTF8'
        config["dsn"] = cx_Oracle.makedsn(host=config["host"], port=config["port"], sid=config["sid"])
        self.db = cx_Oracle.connect(user=config["user"], password=config["password"], dsn=config["dsn"])
        self.db.current_schema = schema
        self.db.autocommit = 1
        self.cursor = self.db.cursor()
        self.logger = logging.getLogger()
        if debug:
            self.logger.setLevel(logging.DEBUG)
        else:
            self.logger.setLevel(logging.INFO)

    def insertDashboard(self, data):
        try:
            dashboards = data["dashboard"]
            dataLanguageChinese = data["language"]["Chinese"]
            table = "IAM_DASHBOARD"
            for i in dashboards:
                dashboard = dashboards[i]
                if "delete" in dashboard and (dashboard["delete"] == True):
                    continue
                Id = self.returnId(table, dashboard["code"], dashboard["namespace"])
                enabled = 0 if "enabled" in dashboard and (dashboard["enabled"] == False) else 1
                position = json.dumps(dashboard["position"]) if "position" in dashboard else ""
                needRoles = 1 if "needRoles" in dashboard and (dashboard["needRoles"] == True) else 0
                if Id:
                    sql = "UPDATE {table} SET CODE='{code}', FD_LEVEL='{level}', DESCRIPTION='{description}', ICON='{icon}', SORT='{sort}', IS_ENABLED='{enabled}', NAMESPACE='{namespace}', POSITION='{position}', NEED_ROLES='{needRoles}'"
                    sql = (sql + " WHERE CODE='{code}' AND FD_LEVEL='{level}'").format(
                        table=table,
                        code=dashboard["code"],
                        namespace=dashboard["namespace"],
                        level=dashboard["level"],
                        description=dashboard["description"],
                        icon=dashboard["icon"],
                        sort=dashboard["sort"],
                        enabled=enabled,
                        position=position,
                        needRoles=needRoles)
                    self.cursor.execute(sql)
                    self.logger.debug("sql: [" + sql + "]")
                else:
                    sql = "INSERT INTO {table} (ID, CODE, NAME, FD_LEVEL, TITLE, DESCRIPTION, ICON, NAMESPACE, SORT, IS_ENABLED, POSITION, NEED_ROLES) VALUES (IAM_DASHBOARD_S.nextval, '{code}', '{name}', '{level}', '{title}', '{description}', '{icon}', '{namespace}', '{sort}', '{enabled}', '{position}', '{needRoles}')"
                    sql = sql.format(
                        table=table,
                        code=dashboard["code"],
                        name=dataLanguageChinese[i],
                        level=dashboard["level"],
                        title=dashboard["title"],
                        description=dashboard["description"],
                        icon=dashboard["icon"],
                        namespace=dashboard["namespace"],
                        sort=dashboard["sort"],
                        enabled=enabled,
                        posiotion=position,
                        needRoles=needRoles)
                    self.cursor.execute(sql)
                    self.logger.debug("sql: [" + sql + "]")
        except:
            self.dealFault()
    def insertDashbaordTl(self, data):
        try:
            dashboards = data["dashboard"]
            dataLanguageEnglish = data["language"]["English"]
            dataLanguageChinese = data["language"]["Chinese"]
            table = "IAM_DASHBOARD_TL"
            for i in dashboards:
                dashboard = dashboards[i]
                Id = self.returnId("IAM_DASHBOARD", dashboard["code"], dashboard["namespace"])
                if Id:
                    sql = "SELECT COUNT(ID) FROM {table} WHERE ID={id}".format(
                            table=table,
                            id=Id[0])
                    self.cursor.execute(sql)
                    self.logger.debug("sql: [" + sql + "]")
                    count = self.cursor.fetchone()
                    if count[0] == 0:
                        self.insertTl(table, 'en_US', Id[0], dataLanguageEnglish[i])
                        self.insertTl(table, 'zh_CN', Id[0], dataLanguageChinese[i])
                    else:
                        self.updateTl(table, 'en_US', Id[0], dataLanguageEnglish[i])
                        self.updateTl(table, 'zh_CN', Id[0], dataLanguageChinese[i])
        except:
            self.dealFault()
    def insertDashboardRole(self, data):
        try:
            dashboards = data["dashboard"]
            table = "IAM_DASHBOARD_ROLE"
            for i in dashboards:
                dashboard = dashboards[i]
                Id = self.returnId("IAM_DASHBOARD", dashboard["code"], dashboard["namespace"])
                if Id:
                    if "roles" in dashboard:
                        roles = dashboard["roles"]
                        for role in roles:
                            sql = "SELECT ID FROM IAM_ROLE WHERE CODE='{code}' AND FD_LEVEL='{level}'".format(code=role, level=dashboard["level"])
                            self.cursor.execute(sql)
                            self.logger.debug("sql: [" + sql + "]")
                            roleId = self.cursor.fetchone()
                            if roleId:
                                sql = "SELECT ID FROM IAM_DASHBOARD_ROLE WHERE DASHBOARD_ID='{dashboardId}' AND ROLE_ID='{roleId}'".format(
                                    table=table,
                                    dashboardId=Id[0],
                                    roleId=roleId[0]
                                )
                                self.cursor.execute(sql)
                                self.logger.debug("sql: [" + sql + "]")
                                select = self.cursor.fetchone()   
                                if not select:
                                    sql = "INSERT INTO {table} (ID, DASHBOARD_ID, ROLE_ID) VALUES (IAM_DASHBOARD_ROLE_S.nextval'{dashboardId}', '{roleId}')".format(
                                        table=table,
                                        dashboardId=Id[0],
                                        roleId=roleId[0]
                                    )
                                    self.cursor.execute(sql)
                                    self.logger.debug("sql: [" + sql + "]")
        except:
            self.dealFault()
