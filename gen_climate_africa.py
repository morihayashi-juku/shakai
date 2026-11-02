# アフリカの気候帯の画像（ケッペンの0.5度グリッドから）
import numpy as np
from PIL import Image
g=np.load('data/koppen.npy')
LAT_T, LAT_B, LON_L, LON_R = 38, -36, -20, 53
first=np.vectorize(lambda s: s[:1])(g)
cls=np.zeros(g.shape,dtype=np.uint8)
for i,k in enumerate('ABCDE',1): cls[first==k]=i
lat=90-0.25-0.5*np.arange(360); lon=-180+0.25+0.5*np.arange(720)
LA,LO=np.meshgrid(lat,lon,indexing='ij')
# 熱帯をさらに 熱帯雨林(Af/Am)とサバナ(Aw/As)に、乾燥帯を砂漠(BW)とステップ(BS)に分ける
sub=np.zeros(g.shape,dtype=np.uint8)
sub[np.isin(g,['Af','Am'])]=1; sub[np.isin(g,['Aw','As'])]=2
sub[np.char.startswith(g,'BW')]=3; sub[np.char.startswith(g,'BS')]=4
sub[first=='C']=5; sub[first=='E']=6; sub[first=='D']=5
r0=int((90-LAT_T)/0.5); r1=int((90-LAT_B)/0.5); c0=int((LON_L+180)/0.5); c1=int((LON_R+180)/0.5)
sub=sub[r0:r1,c0:c1]
S=6
big=np.kron(sub,np.ones((S,S),dtype=np.uint8))
pal={0:(0,0,0,0),1:(47,125,79,255),2:(150,196,120,255),3:(244,220,138,255),4:(236,190,110,255),5:(231,167,122,255),6:(214,226,236,255)}
img=np.zeros(big.shape+(4,),dtype=np.uint8)
for k,c in pal.items(): img[big==k]=c
# ステップ・サバナには点の模様（白黒コピーでも区別できるように）
yy,xx=np.indices(big.shape)
dots=((xx%6)<2)&((yy%6)<2)
img[(big==2)&dots]=(60,110,60,255)
img[(big==4)&dots]=(150,110,50,255)
Image.fromarray(img,'RGBA').save('data/climate_africa.png',optimize=True)
print(img.shape)
