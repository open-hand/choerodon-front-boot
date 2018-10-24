#!/usr/bin/env python
# -*- coding: utf-8 -*-
import traceback
import sys
reload(sys)
sys.setdefaultencoding('utf8')

class Dashboard(object):
    db = {}
    cursor = {}

    def returnId(self, table, code, namespace):
        sql = "SELECT ID FROM {table} WHERE CODE='{code}' AND NAMESPACE='{namespace}'".format(table=table, code=code, namespace=namespace)
        self.cursor.execute(sql)
        Id = self.cursor.fetchone()
        return Id

    def insertTl(self, table, lang, id, name):
        sql = "INSERT INTO {table} (LANG, ID, NAME) VALUES ('{lang}','{id}','{name}')".format(
            table=table,
            lang=lang,
            id=id,
            name=name)
        self.cursor.execute(sql)
    def updateTl(self, table, lang, id, name):
        sql = "UPDATE {table} SET ID='{id}', NAME='{name}' WHERE ID={id} AND LANG='{lang}'".format(
            table=table,
            lang=lang,
            id=id,
            name=name)
        self.cursor.execute(sql)

    def deleteDashboard(self, data):
        try:
            dashboards = data["dashboard"]
            dataLanguageChinese = data["language"]["Chinese"]
            for i in dashboards:
                dashboard = dashboards[i]
                if "delete" in dashboard and (dashboard["delete"] == True):
                    self.deleteByDashboardId(dashboard)
        except:
            self.dealFault()

    def deleteByDashboardId(self, dashboard):
        Id = self.returnId("IAM_DASHBOARD", dashboard["code"], dashboard["namespace"])
        if Id:
            sql = "DELETE FROM IAM_DASHBOARD_TL WHERE ID={id}".format(id=Id["ID"])
            self.cursor.execute(sql)
            sql = "DELETE FROM IAM_DASHBOARD_ROLE WHERE DASHBOARD_ID={id}".format(id=Id["ID"])
            self.cursor.execute(sql)
            sql = "DELETE FROM IAM_USER_DASHBOARD WHERE DASHBOARD_ID={id}".format(id=Id["ID"])
            self.cursor.execute(sql)
            sql = "DELETE FROM IAM_DASHBOARD WHERE ID='{id}'".format(id=Id["ID"])
            self.cursor.execute(sql)
    def dealFault(self):
        traceback.print_exc()
        self.db.rollback()
    def close(self):
        self.cursor.close()
        self.db.close()