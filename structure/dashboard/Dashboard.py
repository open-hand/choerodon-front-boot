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

    def dealFault(self):
        traceback.print_exc()
        self.db.rollback()
    def close(self):
        self.cursor.close()
        self.db.close()