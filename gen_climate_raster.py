# ケッペンの0.5度グリッドから、教科書式の気候帯（6区分）の画像を作る
import numpy as np
from PIL import Image
g=np.load('data/koppen.npy')
LAT_TOP, LAT_BOT, LON_LEFT = 84, -58, -30
cls=np.zeros(g.shape,dtype=np.uint8)  # 0=海 1熱 2乾 3温 4冷 5寒 6高山
first=np.vectorize(lambda s: s[:1])(g)
cls[first=='A']=1; cls[first=='B']=2; cls[first=='C']=3; cls[first=='D']=4; cls[first=='E']=5
lat=90-0.25-0.5*np.arange(360); lon=-180+0.25+0.5*np.arange(720)
LA,LO=np.meshgrid(lat,lon,indexing='ij')
cls[(first=='E')&(np.abs(LA)<55)]=6
tib=(LA>27.5)&(LA<36.5)&(LO>78)&(LO<103)&np.isin(first,['E','D','B'])
# チベット高原：ステップのうち高原の内側だけ（盆地をのぞく）
cls[tib&(first!='B')]=6
cls[tib&(first=='B')&(LA<35)&(LO>80)&(LO<98)]=6
# 経度-30から始まるように並べかえ
shift=int((LON_LEFT+180)/0.5)
cls=np.roll(cls,-shift,axis=1)
r0=int((90-LAT_TOP)/0.5); r1=int((90-LAT_BOT)/0.5)
cls=cls[r0:r1]
S=4
big=np.kron(cls,np.ones((S,S),dtype=np.uint8))
pal={0:(0,0,0,0),1:(47,125,79,255),2:(244,220,138,255),3:(231,167,122,255),4:(127,143,196,255),5:(214,226,236,255)}
img=np.zeros(big.shape+(4,),dtype=np.uint8)
for k,c in pal.items(): img[big==k]=c
# 高山気候：しま模様
yy,xx=np.indices(big.shape)
stripe=((xx+yy)//3)%2==0
img[(big==6)&stripe]=(110,84,66,255)
img[(big==6)&~stripe]=(236,226,214,255)
Image.fromarray(img,'RGBA').save('data/climate.png',optimize=True)
print(img.shape)
