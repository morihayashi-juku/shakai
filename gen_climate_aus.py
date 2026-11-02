# オーストラリア・ニュージーランドの気候帯の画像
import numpy as np
from PIL import Image
g=np.load('data/koppen.npy')
LAT_T, LAT_B, LON_L, LON_R = -8, -48, 110, 180
first=np.vectorize(lambda s: s[:1])(g)
sub=np.zeros(g.shape,dtype=np.uint8)
sub[first=='A']=1
sub[np.char.startswith(g,'BW')]=2; sub[np.char.startswith(g,'BS')]=3
sub[first=='C']=4; sub[first=='D']=4; sub[first=='E']=5
r0=int((90-LAT_T)/0.5); r1=int((90-LAT_B)/0.5); c0=int((LON_L+180)/0.5); c1=int((LON_R+180)/0.5)
sub=sub[r0:r1,c0:c1]
S=6
big=np.kron(sub,np.ones((S,S),dtype=np.uint8))
pal={0:(0,0,0,0),1:(47,125,79,255),2:(244,220,138,255),3:(236,190,110,255),4:(231,167,122,255),5:(214,226,236,255)}
img=np.zeros(big.shape+(4,),dtype=np.uint8)
for k,c in pal.items(): img[big==k]=c
yy,xx=np.indices(big.shape)
dots=((xx%6)<2)&((yy%6)<2)
img[(big==3)&dots]=(150,110,50,255)
Image.fromarray(img,'RGBA').save('data/climate_aus.png',optimize=True)
print(img.shape, {k:int((sub==k).sum()) for k in range(6)})
