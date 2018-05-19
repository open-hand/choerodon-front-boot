#!/bin/bash
usage() { echo "Usage:
此脚本任何一个阶段出现代码冲突，都会停止脚本运行
在与boot平级目录运行
[-a 指定一个模块，推送模块库代码(仅支持一个参数)]
  eg:
    ./boot/structure/pullGit.sh -a boot
[-b 指定一个分支，推送分支代码(仅支持一个参数)]
  eg:
    ./boot/structure/pullGit.sh -b framework
[-m 推送至master，推送master分支代码(无需参数)]
  eg:
    ./boot/structure/pullGit.sh -m
[-h 脚本使用手册]
  eg:
    ./boot/structure/pullGit.sh -h
  " 1>&2; exit 1; }

while getopts "a:b:hm" o; do
    case ${o} in
        a)
          cd $OPTARG
          if [[ $OPTARG == 'boot' || $OPTARG == 'iam' ]];
            then
              git pull origin release-1.2.0
              git push origin release-1.2.0
            else
              git pull origin master
              git push origin master
          fi
          cd ..
          ;;
        b)
          git checkout -m $OPTARG
          git add .
          git commit -m "$OPTARG 提交子模块"
          git push origin $OPTARG
          ;;
        m)
          git checkout -m master
          git add .
          git commit -m "master 提交子模块"
          git push origin master
          ;;
        h)
          usage
          ;;
    esac
done

