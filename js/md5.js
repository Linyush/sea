/* MD5 (RFC 1321) — Joseph Myers implementation + UTF-8 encoding */
var MD5=function(str){
  /* UTF-8 encode: convert Unicode string to byte string */
  str=unescape(encodeURIComponent(str));
  var hex_chr='0123456789abcdef';
  function rhex(n){var s='',j;for(j=0;j<4;j++)s+=hex_chr.charAt((n>>(j*8+4))&0x0F)+hex_chr.charAt((n>>(j*8))&0x0F);return s;}
  function add32(a,b){var lsw=(a&0xFFFF)+(b&0xFFFF),msw=(a>>16)+(b>>16)+(lsw>>16);return(msw<<16)|(lsw&0xFFFF);}
  function cmn(q,a,b,x,s,t){a=add32(add32(a,q),add32(x,t));return add32((a<<s)|(a>>>(32-s)),b);}
  function ff(a,b,c,d,x,s,t){return cmn((b&c)|((~b)&d),a,b,x,s,t);}
  function gg(a,b,c,d,x,s,t){return cmn((b&d)|(c&(~d)),a,b,x,s,t);}
  function hh(a,b,c,d,x,s,t){return cmn(b^c^d,a,b,x,s,t);}
  function ii(a,b,c,d,x,s,t){return cmn(c^(b|(~d)),a,b,x,s,t);}
  function md5cycle(x,k){
    var a=x[0],b=x[1],c=x[2],d=x[3];
    a=ff(a,b,c,d,k[0],7,0xD76AA478);d=ff(d,a,b,c,k[1],12,0xE8C7B756);c=ff(c,d,a,b,k[2],17,0x242070DB);b=ff(b,c,d,a,k[3],22,0xC1BDCEEE);
    a=ff(a,b,c,d,k[4],7,0xF57C0FAF);d=ff(d,a,b,c,k[5],12,0x4787C62A);c=ff(c,d,a,b,k[6],17,0xA8304613);b=ff(b,c,d,a,k[7],22,0xFD469501);
    a=ff(a,b,c,d,k[8],7,0x698098D8);d=ff(d,a,b,c,k[9],12,0x8B44F7AF);c=ff(c,d,a,b,k[10],17,0xFFFF5BB1);b=ff(b,c,d,a,k[11],22,0x895CD7BE);
    a=ff(a,b,c,d,k[12],7,0x6B901122);d=ff(d,a,b,c,k[13],12,0xFD987193);c=ff(c,d,a,b,k[14],17,0xA679438E);b=ff(b,c,d,a,k[15],22,0x49B40821);
    a=gg(a,b,c,d,k[1],5,0xF61E2562);d=gg(d,a,b,c,k[6],9,0xC040B340);c=gg(c,d,a,b,k[11],14,0x265E5A51);b=gg(b,c,d,a,k[0],20,0xE9B6C7AA);
    a=gg(a,b,c,d,k[5],5,0xD62F105D);d=gg(d,a,b,c,k[10],9,0x02441453);c=gg(c,d,a,b,k[15],14,0xD8A1E681);b=gg(b,c,d,a,k[4],20,0xE7D3FBC8);
    a=gg(a,b,c,d,k[9],5,0x21E1CDE6);d=gg(d,a,b,c,k[14],9,0xC33707D6);c=gg(c,d,a,b,k[3],14,0xF4D50D87);b=gg(b,c,d,a,k[8],20,0x455A14ED);
    a=gg(a,b,c,d,k[13],5,0xA9E3E905);d=gg(d,a,b,c,k[2],9,0xFCEFA3F8);c=gg(c,d,a,b,k[7],14,0x676F02D9);b=gg(b,c,d,a,k[12],20,0x8D2A4C8A);
    a=hh(a,b,c,d,k[5],4,0xFFFA3942);d=hh(d,a,b,c,k[8],11,0x8771F681);c=hh(c,d,a,b,k[11],16,0x6D9D6122);b=hh(b,c,d,a,k[14],23,0xFDE5380C);
    a=hh(a,b,c,d,k[1],4,0xA4BEEA44);d=hh(d,a,b,c,k[4],11,0x4BDECFA9);c=hh(c,d,a,b,k[7],16,0xF6BB4B60);b=hh(b,c,d,a,k[10],23,0xBEBFBC70);
    a=hh(a,b,c,d,k[13],4,0x289B7EC6);d=hh(d,a,b,c,k[0],11,0xEAA127FA);c=hh(c,d,a,b,k[3],16,0xD4EF3085);b=hh(b,c,d,a,k[6],23,0x04881D05);
    a=hh(a,b,c,d,k[9],4,0xD9D4D039);d=hh(d,a,b,c,k[12],11,0xE6DB99E5);c=hh(c,d,a,b,k[15],16,0x1FA27CF8);b=hh(b,c,d,a,k[2],23,0xC4AC5665);
    a=ii(a,b,c,d,k[0],6,0xF4292244);d=ii(d,a,b,c,k[7],10,0x432AFF97);c=ii(c,d,a,b,k[14],15,0xAB9423A7);b=ii(b,c,d,a,k[5],21,0xFC93A039);
    a=ii(a,b,c,d,k[12],6,0x655B59C3);d=ii(d,a,b,c,k[3],10,0x8F0CCC92);c=ii(c,d,a,b,k[10],15,0xFFEFF47D);b=ii(b,c,d,a,k[1],21,0x85845DD1);
    a=ii(a,b,c,d,k[8],6,0x6FA87E4F);d=ii(d,a,b,c,k[15],10,0xFE2CE6E0);c=ii(c,d,a,b,k[6],15,0xA3014314);b=ii(b,c,d,a,k[13],21,0x4E0811A1);
    a=ii(a,b,c,d,k[4],6,0xF7537E82);d=ii(d,a,b,c,k[11],10,0xBD3AF235);c=ii(c,d,a,b,k[2],15,0x2AD7D2BB);b=ii(b,c,d,a,k[9],21,0xEB86D391);
    x[0]=add32(a,x[0]);x[1]=add32(b,x[1]);x[2]=add32(c,x[2]);x[3]=add32(d,x[3]);
  }
  function md5blk(s,i){
    var md5blks=[],j;
    for(j=0;j<64;j+=4){md5blks[j>>2]=s.charCodeAt(i+j)+(s.charCodeAt(i+j+1)<<8)+(s.charCodeAt(i+j+2)<<16)+(s.charCodeAt(i+j+3)<<24);}
    return md5blks;
  }
  var n=str.length,
    state=[0x67452301,0xEFCDAB89,0x98BADCFE,0x10325476],
    i,tail;
  for(i=64;i<=n;i+=64){md5cycle(state,md5blk(str,i-64));}
  str=str.substring(i-64);
  tail=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  for(i=0;i<str.length;i++){tail[i>>2]|=str.charCodeAt(i)<<((i%4)<<3);}
  tail[i>>2]|=0x80<<((i%4)<<3);
  if(i>55){md5cycle(state,tail);tail=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];}
  tail[14]=n*8;
  md5cycle(state,tail);
  return rhex(state[0])+rhex(state[1])+rhex(state[2])+rhex(state[3]);
};
