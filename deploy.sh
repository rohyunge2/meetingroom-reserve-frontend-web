#!/bin/bash
if [ $# -lt 1 ]; 
then
	VERSION="latest"
else
	VERSION="$1"
fi

git pull
docker build -t qcr.k8s.bns.co.kr/bnspace/meeting-frontend:$VERSION .
docker login --username admin --password BNSoft2020@ qcr.k8s.bns.co.kr
docker push qcr.k8s.bns.co.kr/bnspace/meeting-frontend:$VERSION
kubectl set image deployment/bnspace-meeting-frontend reactjs=qcr.k8s.bns.co.kr/bnspace/meeting-frontend:$VERSION --record
#kubectl delete pod -l "app=bnspace-meeting-frotend-web"

##### TEST ######
#docker stop test2
#docker rm test2
#docker run -d -p 80:80 --name test2 qcr.k8s.bns.co.kr/bnspace/meeting-frotend-web:$VERSION
