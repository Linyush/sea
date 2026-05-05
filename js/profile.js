/* ============================================================
   PROFILE / INVENTORY MODULE
   ============================================================ */
const P_INV_KEY=()=>'reef_'+_activeTank+'_inventory';
const P_STATUS_LABELS={
  alive:'存活',dead:'死亡',sold:'售出',
  active:'使用中',standby:'闲置',broken:'损坏',
  sealed:'未开封',inuse:'使用中',empty:'已用完',expired:'已过期'
};
const P_STATUS_COLORS={
  alive:'#22bb88',dead:'#e74c3c',sold:'#64748b',
  active:'#22bb88',standby:'#f59e0b',broken:'#e74c3c',
  sealed:'#64748b',inuse:'#22bb88',empty:'#64748b',expired:'#e74c3c'
};
const P_SPECIES_OPTS=['鱼','珊瑚','无脊椎','藻','其他'];
const P_EQ_CATS=['水泵','灯','造浪','蛋分','加热棒','冷水机','温度计','滴定','钙反','煮豆机','补水器','杀菌灯','滤布机','喂食器','检测设备','插座','串联缸','珊瑚支架','工具','增氧设备','造景','柜子','盐度计','其他'];
const P_CM_CATS=['盐','食物','添加剂','试剂','药品','吸附剂','滤材','包装','板材','胶水','水管','珊瑚基座','滤袋','滤棉','滤布','其他'];
const P_ICONS={'clownfish':'<svg viewBox="0 0 80 80"><ellipse cx="38" cy="40" rx="18" ry="11" fill="currentColor"/><path d="M56 40c3-4 7-9 7-9v18s-4-5-7-9" fill="currentColor"/><ellipse cx="38" cy="40" rx="18" ry="11" fill="none" stroke="currentColor" stroke-width="1" opacity=".3"/><rect x="28" y="29" width="3" height="22" rx="1.5" fill="#fff" opacity=".7"/><rect x="36" y="29" width="3" height="22" rx="1.5" fill="#fff" opacity=".7"/><rect x="44" y="30" width="2.5" height="20" rx="1.2" fill="#fff" opacity=".5"/><circle cx="27" cy="38" r="2.5" fill="#fff"/><circle cx="27" cy="38" r="1.2" fill="#111"/></svg>',
'tang':'<svg viewBox="0 0 80 80"><ellipse cx="38" cy="40" rx="16" ry="15" fill="currentColor"/><path d="M54 40l10-4v8l-10-4" fill="currentColor" opacity=".8"/><path d="M38 25c-1-3 0-6 1-5l3 5" fill="currentColor" opacity=".7"/><path d="M38 55c-1 3 0 6 1 5l3-5" fill="currentColor" opacity=".7"/><circle cx="28" cy="37" r="2.5" fill="#fff"/><circle cx="28" cy="37" r="1.2" fill="#111"/><path d="M50 38c1 0 2 .5 2 2s-1 2-2 2" fill="#fff" opacity=".6" stroke="none"/></svg>',
'wrasse':'<svg viewBox="0 0 80 80"><path d="M14 40c6-10 16-13 26-13s20 5 24 7c-4 2-14 12-24 12S20 50 14 40z" fill="currentColor"/><path d="M62 34l6-5v22l-6-5" fill="currentColor" opacity=".7"/><path d="M30 30c2-5 5-6 7-4" fill="currentColor" opacity=".6"/><path d="M30 50c2 5 5 6 7 4" fill="currentColor" opacity=".6"/><circle cx="22" cy="38" r="2.5" fill="#fff"/><circle cx="22" cy="38" r="1.2" fill="#111"/><path d="M32 38h16" stroke="#fff" stroke-width="1" opacity=".3"/></svg>',
'goby':'<svg viewBox="0 0 80 80"><ellipse cx="36" cy="44" rx="14" ry="9" fill="currentColor"/><path d="M50 44c4-2 9-7 11-6v12c-2 1-7-4-11-6" fill="currentColor" opacity=".8"/><path d="M36 35c1-3 4-5 6-3" fill="currentColor" opacity=".7"/><circle cx="28" cy="40" r="3" fill="#fff"/><circle cx="28" cy="40" r="1.5" fill="#111"/><rect x="18" y="53" width="40" height="2" rx="1" fill="currentColor" opacity=".3"/></svg>',
'angelfish':'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="40" rx="13" ry="19" fill="currentColor"/><path d="M53 40l9-3v6l-9-3" fill="currentColor" opacity=".8"/><path d="M40 21l-2-7 4 2" fill="currentColor" opacity=".7"/><path d="M40 59l-2 7 4-2" fill="currentColor" opacity=".7"/><circle cx="34" cy="36" r="2.5" fill="#fff"/><circle cx="34" cy="36" r="1.2" fill="#111"/><path d="M30 40h20" stroke="#fff" stroke-width="1.5" opacity=".25"/><path d="M32 34c3-1 7-1 10 0" stroke="#fff" stroke-width="1" opacity=".2" fill="none"/></svg>',
'blenny':'<svg viewBox="0 0 80 80"><ellipse cx="36" cy="42" rx="12" ry="9" fill="currentColor"/><path d="M48 42c3-1 9-5 11-3v6c-2 2-8-1-11-3" fill="currentColor" opacity=".7"/><circle cx="30" cy="38" r="4" fill="#fff"/><circle cx="30" cy="38" r="2" fill="#111"/><path d="M27 32c-1-4 1-5 2-3m5-1c0-4 2-5 3-3" fill="currentColor" opacity=".6" stroke="none"/></svg>',
'dottyback':'<svg viewBox="0 0 80 80"><ellipse cx="38" cy="40" rx="14" ry="10" fill="currentColor"/><path d="M52 40c3-2 7-5 9-3v6c-2 2-6-1-9-3" fill="currentColor" opacity=".8"/><path d="M38 30l-1-3h5l-1 3" fill="currentColor" opacity=".6"/><circle cx="29" cy="38" r="2.5" fill="#fff"/><circle cx="29" cy="38" r="1.2" fill="#111"/><path d="M38 40h0" stroke="none"/><rect x="22" y="39" width="24" height="2" rx="1" fill="#fff" opacity=".15"/></svg>',
'cardinal':'<svg viewBox="0 0 80 80"><ellipse cx="38" cy="40" rx="14" ry="12" fill="currentColor"/><path d="M52 40l8-4v8l-8-4" fill="currentColor" opacity=".8"/><path d="M38 28c2-4 4-4 5-2" fill="currentColor" opacity=".6"/><path d="M38 52c2 4 4 4 5 2" fill="currentColor" opacity=".6"/><circle cx="30" cy="37" r="5" fill="#fff"/><circle cx="30" cy="37" r="2.5" fill="#111"/><circle cx="31" cy="36" r="1" fill="#fff"/></svg>',
'hawkfish':'<svg viewBox="0 0 80 80"><ellipse cx="38" cy="40" rx="14" ry="10" fill="currentColor"/><path d="M52 40c3-2 8-5 10-3v6c-2 2-7-1-10-3" fill="currentColor" opacity=".8"/><path d="M28 30l3-2 3 1 3-2 3 1 3-2 3 2" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="28" cy="38" r="2.5" fill="#fff"/><circle cx="28" cy="38" r="1.2" fill="#111"/><path d="M30 50l-2 6m10-6l2 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
'other_fish':'<svg viewBox="0 0 80 80"><path d="M20 40c8-12 24-13 34-7l8-7v28l-8-7c-10 6-26 5-34-7z" fill="currentColor"/><circle cx="28" cy="38" r="2.5" fill="#fff"/><circle cx="28" cy="38" r="1.2" fill="#111"/><path d="M36 36v8" stroke="#fff" stroke-width="1.5" opacity=".3"/></svg>',
'sps':'<svg viewBox="0 0 80 80"><rect x="14" y="52" width="52" height="8" rx="3" fill="currentColor" opacity=".5"/><g fill="currentColor"><path d="M22 52v-6m-3 4l3-4 3 4m-5-2h4"/><path d="M32 52v-8m-3 5l3-5 3 5m-5-3h4"/><path d="M42 52v-9m-3 6l3-6 3 6m-5-3h4"/><path d="M52 52v-7m-3 5l3-5 3 5m-5-3h4"/><path d="M62 52v-5m-2 3l2-3 2 3m-3-1h3"/><path d="M27 52v-7m-2 5l2-5 2 5m-3-3h3"/><path d="M37 52v-8m-3 5l3-5 3 5m-5-3h4"/><path d="M47 52v-6m-2 4l2-4 2 4m-3-2h3"/><path d="M57 52v-7m-2 5l2-5 2 5m-3-3h3"/></g></svg>',
'lps':'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="44" rx="20" ry="14" fill="currentColor" opacity=".4"/><circle cx="32" cy="40" r="6" fill="currentColor"/><circle cx="32" cy="40" r="3" fill="#fff" opacity=".2"/><circle cx="44" cy="38" r="6" fill="currentColor"/><circle cx="44" cy="38" r="3" fill="#fff" opacity=".2"/><circle cx="38" cy="50" r="5.5" fill="currentColor"/><circle cx="38" cy="50" r="2.5" fill="#fff" opacity=".2"/><circle cx="50" cy="48" r="5" fill="currentColor"/><circle cx="50" cy="48" r="2.5" fill="#fff" opacity=".2"/><circle cx="26" cy="48" r="4.5" fill="currentColor" opacity=".8"/><circle cx="52" cy="40" r="4" fill="currentColor" opacity=".7"/></svg>',
'soft':'<svg viewBox="0 0 80 80"><path d="M40 64v-6" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><ellipse cx="40" cy="54" rx="6" ry="3" fill="currentColor" opacity=".6"/><ellipse cx="40" cy="44" rx="20" ry="8" fill="currentColor"/><ellipse cx="40" cy="42" rx="18" ry="6" fill="currentColor"/><ellipse cx="40" cy="41" rx="16" ry="4" fill="#fff" opacity=".1"/><g stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".7"><path d="M26 40v-4m4 4v-5m4 5v-5m4 5v-5m4 5v-5m4 5v-5m4 5v-5m4 5v-4"/></g><g fill="currentColor" opacity=".8"><circle cx="26" cy="34" r="1.2"/><circle cx="30" cy="33" r="1.2"/><circle cx="34" cy="33" r="1.2"/><circle cx="38" cy="33" r="1.2"/><circle cx="42" cy="33" r="1.2"/><circle cx="46" cy="33" r="1.2"/><circle cx="50" cy="33" r="1.2"/><circle cx="54" cy="34" r="1.2"/></g></svg>',
'mushroom':'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="42" rx="22" ry="11" fill="currentColor"/><ellipse cx="40" cy="40" rx="20" ry="9" fill="currentColor"/><ellipse cx="40" cy="39" rx="18" ry="7" fill="#fff" opacity=".1"/><path d="M40 53v9" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="30" cy="39" r="2.5" fill="#fff" opacity=".2"/><circle cx="36" cy="37" r="2" fill="#fff" opacity=".2"/><circle cx="43" cy="38" r="2.5" fill="#fff" opacity=".2"/><circle cx="50" cy="40" r="2" fill="#fff" opacity=".2"/><circle cx="33" cy="43" r="1.8" fill="#fff" opacity=".15"/><circle cx="40" cy="44" r="2" fill="#fff" opacity=".15"/><circle cx="47" cy="43" r="1.8" fill="#fff" opacity=".15"/></svg>',
'zoa':'<svg viewBox="0 0 80 80"><circle cx="28" cy="34" r="8" fill="currentColor"/><circle cx="28" cy="34" r="4" fill="currentColor" stroke="#fff" stroke-width=".5" opacity=".8"/><circle cx="28" cy="34" r="2" fill="#111" opacity=".6"/><circle cx="48" cy="32" r="7.5" fill="currentColor"/><circle cx="48" cy="32" r="3.5" fill="currentColor" stroke="#fff" stroke-width=".5" opacity=".8"/><circle cx="48" cy="32" r="1.8" fill="#111" opacity=".6"/><circle cx="36" cy="50" r="7" fill="currentColor"/><circle cx="36" cy="50" r="3.5" fill="currentColor" stroke="#fff" stroke-width=".5" opacity=".8"/><circle cx="36" cy="50" r="1.8" fill="#111" opacity=".6"/><circle cx="54" cy="48" r="6" fill="currentColor" opacity=".8"/><circle cx="54" cy="48" r="3" fill="currentColor" stroke="#fff" stroke-width=".5" opacity=".7"/><circle cx="54" cy="48" r="1.5" fill="#111" opacity=".5"/><circle cx="20" cy="50" r="5.5" fill="currentColor" opacity=".7"/><circle cx="20" cy="50" r="2.5" fill="currentColor" stroke="#fff" stroke-width=".5" opacity=".7"/><circle cx="20" cy="50" r="1.2" fill="#111" opacity=".5"/></svg>',
'anemone':'<svg viewBox="0 0 80 80"><path d="M30 62h20v-6c0-2-4-4-10-4s-10 2-10 4v6" fill="currentColor" opacity=".6"/><path d="M34 52c-1-5-3-12-5-16" stroke="currentColor" stroke-width="2.5" fill="none"/><path d="M38 52c0-5 0-12 0-16" stroke="currentColor" stroke-width="2.5" fill="none"/><path d="M42 52c0-5 0-12 0-16" stroke="currentColor" stroke-width="2.5" fill="none"/><path d="M46 52c1-5 3-12 5-16" stroke="currentColor" stroke-width="2.5" fill="none"/><path d="M30 52c-2-4-5-10-8-12" stroke="currentColor" stroke-width="2.5" fill="none"/><path d="M50 52c2-4 5-10 8-12" stroke="currentColor" stroke-width="2.5" fill="none"/><circle cx="29" cy="34" r="4" fill="currentColor"/><circle cx="38" cy="33" r="4" fill="currentColor"/><circle cx="42" cy="34" r="3.5" fill="currentColor"/><circle cx="51" cy="34" r="4" fill="currentColor"/><circle cx="22" cy="38" r="3.5" fill="currentColor"/><circle cx="58" cy="38" r="3.5" fill="currentColor"/><circle cx="29" cy="34" r="2" fill="#fff" opacity=".3"/><circle cx="38" cy="33" r="2" fill="#fff" opacity=".3"/><circle cx="51" cy="34" r="2" fill="#fff" opacity=".3"/></svg>',
'gorgonian':'<svg viewBox="0 0 80 80"><rect x="37" y="54" width="6" height="10" rx="2" fill="currentColor" opacity=".5"/><path d="M40 54v-14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M40 44l-10-12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M40 44l10-12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M40 40l-6-10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M40 40l6-10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M30 32l-4-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M50 32l4-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="30" cy="30" r="4" fill="currentColor"/><circle cx="50" cy="30" r="4" fill="currentColor"/><circle cx="34" cy="28" r="3.5" fill="currentColor"/><circle cx="46" cy="28" r="3.5" fill="currentColor"/><circle cx="40" cy="26" r="4" fill="currentColor"/><circle cx="26" cy="24" r="3" fill="currentColor"/><circle cx="54" cy="24" r="3" fill="currentColor"/><circle cx="30" cy="30" r="2" fill="#fff" opacity=".3"/><circle cx="50" cy="30" r="2" fill="#fff" opacity=".3"/><circle cx="40" cy="26" r="2" fill="#fff" opacity=".3"/></svg>',
'brain':'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="42" rx="20" ry="15" fill="currentColor"/><ellipse cx="40" cy="40" rx="18" ry="13" fill="currentColor"/><path d="M24 38c5 4 9-2 13 2s7-2 11 2c4 4 8-2 10 2" stroke="#fff" stroke-width="2" opacity=".2" fill="none"/><path d="M26 44c4 3 8-2 11 2s6-2 9 2c3 3 7-2 9 2" stroke="#fff" stroke-width="2" opacity=".2" fill="none"/><path d="M28 50c4 2 6-1 9 1s5-1 8 1c3 1 5-1 7 1" stroke="#fff" stroke-width="1.5" opacity=".15" fill="none"/><path d="M30 34c3 2 7-1 10 1s6-1 8 1" stroke="#fff" stroke-width="1.5" opacity=".15" fill="none"/></svg>',
'torch':'<svg viewBox="0 0 80 80"><rect x="36" y="56" width="8" height="8" rx="2" fill="currentColor" opacity=".5"/><path d="M34 56c-1-6-3-14-5-18" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M38 56c0-6 0-14-1-18" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M42 56c0-6 0-14 1-18" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M46 56c1-6 3-14 5-18" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="29" cy="36" rx="6" ry="3" fill="currentColor"/><ellipse cx="37" cy="35" rx="5.5" ry="3" fill="currentColor"/><ellipse cx="43" cy="35" rx="5.5" ry="3" fill="currentColor"/><ellipse cx="51" cy="36" rx="6" ry="3" fill="currentColor"/><ellipse cx="29" cy="35" rx="3" ry="1.5" fill="#fff" opacity=".25"/><ellipse cx="37" cy="34" rx="3" ry="1.5" fill="#fff" opacity=".25"/><ellipse cx="43" cy="34" rx="3" ry="1.5" fill="#fff" opacity=".25"/><ellipse cx="51" cy="35" rx="3" ry="1.5" fill="#fff" opacity=".25"/></svg>',
'plate':'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="46" rx="22" ry="8" fill="currentColor" opacity=".6"/><ellipse cx="40" cy="44" rx="22" ry="8" fill="currentColor"/><ellipse cx="40" cy="42" rx="20" ry="6" fill="currentColor"/><ellipse cx="40" cy="41" rx="16" ry="4" fill="#fff" opacity=".1"/><circle cx="32" cy="42" r="1.5" fill="#fff" opacity=".2"/><circle cx="38" cy="40" r="1.5" fill="#fff" opacity=".2"/><circle cx="44" cy="41" r="1.5" fill="#fff" opacity=".2"/><circle cx="50" cy="43" r="1.5" fill="#fff" opacity=".2"/><circle cx="36" cy="44" r="1" fill="#fff" opacity=".15"/><circle cx="46" cy="44" r="1" fill="#fff" opacity=".15"/><path d="M40 52v8" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".5"/></svg>',
'carpet':'<svg viewBox="0 0 80 80"><rect x="12" y="50" width="56" height="10" rx="4" fill="currentColor" opacity=".4"/><g fill="currentColor"><circle cx="18" cy="48" r="2.5"/><circle cx="26" cy="46" r="3"/><circle cx="34" cy="45" r="3"/><circle cx="42" cy="46" r="3"/><circle cx="50" cy="45" r="3"/><circle cx="58" cy="47" r="2.5"/><circle cx="22" cy="43" r="2.5"/><circle cx="30" cy="42" r="2.5"/><circle cx="38" cy="41" r="2.8"/><circle cx="46" cy="42" r="2.5"/><circle cx="54" cy="43" r="2.5"/><circle cx="62" cy="45" r="2"/></g><g stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M18 48v-4m8-2v-4m8-1v-4m8 0v-4m8 1v-4m8 2v-3"/><path d="M22 43v-4m8-1v-4m8 0v-4m8 0v-4m8 1v-3"/></g></svg>',
'other_coral':'<svg viewBox="0 0 80 80"><path d="M40 64v-10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M40 54c0-6-4-10-8-16" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M40 54c0-6 4-10 8-16" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M40 54c0-8 0-14 0-20" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="32" cy="36" r="4" fill="currentColor"/><circle cx="48" cy="36" r="4" fill="currentColor"/><circle cx="40" cy="32" r="4.5" fill="currentColor"/><circle cx="32" cy="36" r="2" fill="#fff" opacity=".2"/><circle cx="48" cy="36" r="2" fill="#fff" opacity=".2"/><circle cx="40" cy="32" r="2" fill="#fff" opacity=".2"/></svg>',
'goniopora':'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="56" rx="12" ry="4" fill="currentColor" opacity=".5"/><path d="M30 52v-10m5 8v-12m5 10v-14m5 12v-12m5 10v-10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="30" cy="40" r="4.5" fill="currentColor"/><circle cx="30" cy="40" r="2" fill="#fff" opacity=".3"/><circle cx="35" cy="36" r="4.5" fill="currentColor"/><circle cx="35" cy="36" r="2" fill="#fff" opacity=".3"/><circle cx="40" cy="34" r="5" fill="currentColor"/><circle cx="40" cy="34" r="2.5" fill="#fff" opacity=".3"/><circle cx="45" cy="36" r="4.5" fill="currentColor"/><circle cx="45" cy="36" r="2" fill="#fff" opacity=".3"/><circle cx="50" cy="40" r="4.5" fill="currentColor"/><circle cx="50" cy="40" r="2" fill="#fff" opacity=".3"/></svg>',
'snail':'<svg viewBox="0 0 80 80"><ellipse cx="38" cy="52" rx="14" ry="8" fill="currentColor" opacity=".5"/><circle cx="42" cy="38" r="13" fill="currentColor"/><circle cx="44" cy="36" r="8" fill="currentColor" opacity=".8"/><circle cx="45" cy="35" r="4" fill="currentColor" opacity=".6"/><path d="M42 38c2-4 5-6 6-4" stroke="#fff" stroke-width="1.5" opacity=".3" fill="none"/><path d="M24" cy="44" r="0" fill="none"/><path d="M26 50l-4-8m6 6l-2-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".7"/></svg>',
'shrimp':'<svg viewBox="0 0 80 80"><path d="M22 38c4-4 10-6 16-4 6 2 12 10 16 14 2 3 1 6-2 7-4 2-10 0-14-4s-10-6-16-4" fill="currentColor"/><path d="M22 38c4-4 10-6 16-4" fill="currentColor" opacity=".8"/><circle cx="24" cy="36" r="2" fill="#fff"/><circle cx="24" cy="36" r="1" fill="#111"/><path d="M20 32l-6-8m6 0l8-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M48 55l3 5m-6-3l2 5m-6-5l1 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".7"/></svg>',
'crab':'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="46" rx="14" ry="10" fill="currentColor"/><ellipse cx="40" cy="44" rx="12" ry="8" fill="currentColor"/><circle cx="34" cy="40" r="2.5" fill="#fff"/><circle cx="34" cy="40" r="1.2" fill="#111"/><circle cx="46" cy="40" r="2.5" fill="#fff"/><circle cx="46" cy="40" r="1.2" fill="#111"/><path d="M26 44c-4-2-8-4-10-2l-2 4 5 1" fill="currentColor" opacity=".8"/><path d="M54 44c4-2 8-4 10-2l2 4-5 1" fill="currentColor" opacity=".8"/><path d="M32 54l-3 5m8-5l1 5m6-5l1 5m6-5l3 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".6"/></svg>',
'urchin':'<svg viewBox="0 0 80 80"><circle cx="40" cy="44" r="12" fill="currentColor"/><circle cx="40" cy="42" r="10" fill="currentColor"/><circle cx="40" cy="41" r="6" fill="#fff" opacity=".1"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M40 32v-8m-8 10l-5-6m16 6l5-6m-20 12l-7-2m28 2l7-2m-22 12l-5 5m16-5l5 5m-10 1v6"/></g></svg>',
'starfish':'<svg viewBox="0 0 80 80"><path d="M40 16l5 16h16l-13 9 5 16-13-9-13 9 5-16-13-9h16z" fill="currentColor"/><circle cx="40" cy="40" r="5" fill="currentColor" opacity=".8"/><circle cx="40" cy="40" r="3" fill="#fff" opacity=".15"/></svg>',
'clam':'<svg viewBox="0 0 80 80"><path d="M16 46c0-12 11-22 24-22s24 10 24 22" fill="currentColor" opacity=".6"/><path d="M16 46c0 7 11 14 24 14s24-7 24-14" fill="currentColor"/><path d="M16 46h48" stroke="#fff" stroke-width="1.5" opacity=".3"/><path d="M26 46l14-16 14 16" fill="currentColor" opacity=".4"/><path d="M28 52c3 1 7 2 12 0m0 1c4 2 8 1 12 0" stroke="#fff" stroke-width="1.5" opacity=".2" fill="none"/><circle cx="40" cy="38" r="2" fill="#fff" opacity=".3"/></svg>',
'cucumber':'<svg viewBox="0 0 80 80"><path d="M16 46c0-5 7-10 18-10h12c11 0 18 5 18 10s-7 10-18 10H34c-11 0-18-5-18-10z" fill="currentColor"/><path d="M16 44c0-4 7-8 18-8h12c11 0 18 4 18 8" fill="#fff" opacity=".1"/><circle cx="28" cy="44" r="2" fill="#fff" opacity=".2"/><circle cx="36" cy="43" r="1.5" fill="#fff" opacity=".2"/><circle cx="44" cy="44" r="1.5" fill="#fff" opacity=".2"/><circle cx="52" cy="43" r="2" fill="#fff" opacity=".2"/><path d="M20 44c-2-1-4-3-4-1s2 4 4 3" fill="currentColor" opacity=".7"/></svg>',
'other_invert':'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="44" rx="16" ry="12" fill="currentColor"/><ellipse cx="40" cy="42" rx="14" ry="10" fill="currentColor"/><ellipse cx="40" cy="40" rx="10" ry="6" fill="#fff" opacity=".1"/><circle cx="34" cy="42" r="2" fill="#fff"/><circle cx="34" cy="42" r="1" fill="#111"/><circle cx="46" cy="42" r="2" fill="#fff"/><circle cx="46" cy="42" r="1" fill="#111"/><path d="M26 34l-4-7m28 7l4-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
'algae':'<svg viewBox="0 0 80 80"><path d="M40 64v-14c0-4-2-6-2-10s2-8 2-12" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M32 64v-10c0-3-1.5-5-1.5-8s1.5-6 1.5-10" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/><path d="M48 64v-10c0-3 1.5-5 1.5-8s-1.5-6-1.5-10" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/></svg>',
'other_live':'<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="16" fill="currentColor"/><circle cx="40" cy="40" r="12" fill="currentColor"/><circle cx="40" cy="38" r="8" fill="#fff" opacity=".1"/><circle cx="36" cy="36" r="2" fill="#fff"/><circle cx="36" cy="36" r="1" fill="#111"/><circle cx="44" cy="36" r="2" fill="#fff"/><circle cx="44" cy="36" r="1" fill="#111"/><path d="M35 46c3 2 7 2 10 0" stroke="#fff" stroke-width="1.5" fill="none" opacity=".6"/></svg>',
'pump':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="24" y="30" width="36" height="22" rx="3"/><line x1="32" y1="34" x2="32" y2="48"/><line x1="38" y1="34" x2="38" y2="48"/><line x1="44" y1="34" x2="44" y2="48"/><line x1="50" y1="34" x2="50" y2="48"/><rect x="14" y="33" width="10" height="16" rx="2"/><path d="M19 33v-8h6"/><line x1="20" y1="52" x2="20" y2="58"/><line x1="54" y1="52" x2="54" y2="58"/><line x1="16" y1="58" x2="58" y2="58"/></svg>',
'light':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="28" width="44" height="12" rx="3"/><path d="M26 40v4m10-4v4m8-4v4m10-4v4"/><path d="M30 48l-4 10m24-10l4 10"/><line x1="14" y1="28" x2="14" y2="40"/><line x1="66" y1="28" x2="66" y2="40"/></svg>',
'wave':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="40" r="14"/><circle cx="40" cy="40" r="6"/><path d="M34 40l-8 0m20 0h8"/><path d="M40 34v-8m0 20v8"/><rect x="56" y="36" width="10" height="8" rx="2"/></svg>',
'skimmer':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="28" y="14" width="24" height="52" rx="5"/><path d="M28 24h24"/><path d="M28 56h24"/><circle cx="40" cy="40" r="4"/><path d="M36 62v4m8-4v4"/><path d="M34 18h12"/></svg>',
'heater':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="34" y="14" width="12" height="52" rx="6"/><path d="M38 26h4m-4 8h4m-4 8h4m-4 8h4"/><path d="M34 14h12"/><circle cx="40" cy="58" r="3"/></svg>',
'chiller':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="22" width="48" height="36" rx="4"/><rect x="24" y="30" width="14" height="14" rx="7"/><path d="M31 34v8m-3-4h6"/><line x1="48" y1="30" x2="48" y2="44"/><line x1="54" y1="30" x2="54" y2="44"/><line x1="20" y1="58" x2="20" y2="64"/><line x1="60" y1="58" x2="60" y2="64"/></svg>',
'thermo':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="34" y="14" width="12" height="38" rx="6"/><circle cx="40" cy="56" r="8"/><circle cx="40" cy="56" r="4" fill="currentColor" stroke="none"/><line x1="40" y1="52" x2="40" y2="28"/><path d="M46 20h6m-6 8h6"/></svg>',
'doser':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="22" y="24" width="36" height="32" rx="4"/><circle cx="33" cy="40" r="5"/><circle cx="47" cy="40" r="5"/><path d="M30 24v-6m10 6v-6m10 6v-6"/><path d="M30 56v6m10-6v6m10-6v6"/></svg>',
'reactor':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="28" y="14" width="20" height="52" rx="4"/><path d="M28 24h20m-20 14h20m-20 14h20"/><circle cx="38" cy="45" r="2"/><circle cx="38" cy="38" r="1.5"/><path d="M52 20h6v16h-6"/><circle cx="55" cy="30" r="2"/></svg>',
'beansoup':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="26" y="18" width="22" height="44" rx="4"/><path d="M26 28h22"/><circle cx="37" cy="38" r="2"/><circle cx="33" cy="44" r="1.5"/><circle cx="40" cy="48" r="1.5"/><circle cx="35" cy="52" r="1.5"/><path d="M48 34h8v12h-8"/><line x1="32" y1="62" x2="32" y2="68"/><line x1="42" y1="62" x2="42" y2="68"/></svg>',
'ato':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="24" width="24" height="36" rx="3"/><path d="M20 42h16"/><path d="M28 42v-8"/><rect x="48" y="38" width="16" height="20" rx="3"/><path d="M56 38v-8"/><path d="M40 44h8"/><circle cx="56" cy="50" r="3"/></svg>',
'uv':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="28" y="18" width="12" height="44" rx="6"/><path d="M22 30l4 2m-4 16l4-2"/><path d="M46 30l-4 2m4 16l-4-2"/><path d="M28 26h12m-12 28h12"/><path d="M34 14v4m0 44v4"/></svg>',
'roller':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="20" y="22" width="40" height="36" rx="4"/><circle cx="34" cy="34" r="6"/><circle cx="46" cy="50" r="6"/><path d="M38 30l4 16"/><path d="M20 42h40"/></svg>',
'feeder':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="38" r="14"/><path d="M40 24v14l10 6"/><rect x="36" y="52" width="8" height="12" rx="2"/><path d="M54 38h10v8"/><line x1="40" y1="64" x2="40" y2="68"/></svg>',
'tester':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="24" y="14" width="24" height="16" rx="3"/><path d="M30 30v26c0 4 2 8 6 8s6-4 6-8V30"/><path d="M30 42h12m-12 8h12"/><path d="M52 20h10v10h-10"/><path d="M57 30v10"/></svg>',
'socket':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="28" width="52" height="24" rx="4"/><circle cx="28" cy="40" r="4"/><circle cx="42" cy="40" r="4"/><circle cx="56" cy="40" r="4"/><line x1="24" y1="52" x2="24" y2="56"/><line x1="56" y1="52" x2="56" y2="56"/><circle cx="18" cy="32" r="1.5" fill="currentColor" stroke="none"/></svg>',
'other_eq':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="40" r="14"/><circle cx="40" cy="40" r="6"/><path d="M40 20v6m0 28v6m-20-20h6m28 0h6"/><path d="M26 26l4 4m20 20l4 4m0-28l-4 4m-20 20l-4 4"/></svg>',
'salt':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M24 26h32l-4 38H28l-4-38z"/><path d="M28 18h24v8H28z"/><path d="M32 36h8m-4-4v8"/><path d="M38 26c0-4 8-4 8 0"/></svg>',
'food':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="26" y="22" width="28" height="38" rx="6"/><path d="M26 32h28"/><circle cx="36" cy="42" r="2" fill="currentColor" stroke="none"/><circle cx="44" cy="46" r="2" fill="currentColor" stroke="none"/><circle cx="38" cy="50" r="1.5" fill="currentColor" stroke="none"/><path d="M36 22v-6h8v6"/></svg>',
'additive':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M30 28h20l-2 36H32l-2-36z"/><rect x="34" y="18" width="12" height="10" rx="2"/><path d="M40 18v-4"/><path d="M30 44h20"/></svg>',
'reagent':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="22" width="48" height="36" rx="4"/><rect x="22" y="30" width="8" height="20" rx="2"/><rect x="34" y="30" width="8" height="20" rx="2"/><rect x="46" y="30" width="8" height="20" rx="2"/><path d="M16 22h48"/></svg>',
'medicine':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="28" y="22" width="24" height="38" rx="5"/><path d="M28 32h24"/><path d="M36 42h8m-4-4v8"/><rect x="34" y="14" width="12" height="8" rx="2"/></svg>',
'other_cm':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="40" r="16"/><path d="M40 30v6l4 4"/><circle cx="40" cy="40" r="2" fill="currentColor" stroke="none"/></svg>',
'sertank':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="28" width="24" height="24" rx="3"/><rect x="46" y="28" width="24" height="24" rx="3"/><path d="M34 40h12"/><path d="M38 36l4 4-4 4"/><path d="M14 34h16m-16 8h16m20-8h16m-16 8h16"/></svg>',
'coralrack':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 60h40"/><path d="M24 60V36"/><path d="M56 60V36"/><path d="M24 36h32"/><path d="M24 48h32"/><path d="M32 36v12m8-12v12m8-12v12"/><circle cx="32" cy="30" r="3"/><circle cx="48" cy="30" r="3"/></svg>',
'tool':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M50 18c-6 0-10 4-10 10 0 2 .4 3.6 1 5L22 52l6 6 19-19c1.4.6 3 1 5 1 6 0 10-4 10-10l-6 6-5-5 6-6c-1-.4-2-.6-3-.6z"/><path d="M28 52l-8 8m4-4l4 4"/></svg>',
'airpump':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="22" y="24" width="24" height="32" rx="4"/><path d="M46 36h8v8h-8"/><circle cx="34" cy="36" r="4"/><path d="M30 48h8"/><path d="M34 56v8"/><circle cx="34" cy="67" r="2" fill="currentColor" stroke="none"/><circle cx="30" cy="64" r="1.5" fill="currentColor" stroke="none"/><circle cx="38" cy="65" r="1" fill="currentColor" stroke="none"/></svg>',
'scape':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M16 58c4-6 8-14 14-18s10-2 14-8c4-6 10-12 18-10"/><path d="M14 62h52"/><path d="M28 50c2-2 6-2 8 0"/><circle cx="50" cy="44" r="3"/><path d="M44 58c0-4 3-8 8-8s6 2 8 4"/></svg>',
'cabinet':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="16" width="44" height="48" rx="3"/><path d="M18 40h44"/><path d="M36 24h8m-8 24h8"/><line x1="26" y1="64" x2="26" y2="70"/><line x1="54" y1="64" x2="54" y2="70"/></svg>',
'salinity':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="28" y="12" width="24" height="56" rx="12"/><path d="M28 44h24"/><circle cx="40" cy="54" r="6"/><circle cx="40" cy="54" r="3" fill="currentColor" stroke="none"/><path d="M36 28h8m-6 6h4"/></svg>',
'adsorbent':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M24 24h32v36H24z"/><path d="M24 36h32m-32 12h32"/><circle cx="32" cy="30" r="2" fill="currentColor" stroke="none"/><circle cx="40" cy="30" r="2" fill="currentColor" stroke="none"/><circle cx="48" cy="30" r="2" fill="currentColor" stroke="none"/><circle cx="36" cy="42" r="2" fill="currentColor" stroke="none"/><circle cx="44" cy="42" r="2" fill="currentColor" stroke="none"/><path d="M32 60h16"/></svg>',
'media':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="22" y="20" width="36" height="44" rx="4"/><path d="M22 34h36"/><circle cx="30" cy="44" r="3" fill="currentColor" stroke="none"/><circle cx="40" cy="48" r="2" fill="currentColor" stroke="none"/><circle cx="50" cy="42" r="2.5" fill="currentColor" stroke="none"/><circle cx="35" cy="54" r="2" fill="currentColor" stroke="none"/><circle cx="45" cy="56" r="1.5" fill="currentColor" stroke="none"/></svg>',
'package':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="26" width="44" height="34" rx="3"/><path d="M18 38h44"/><path d="M34 38v-12h12v12"/><path d="M36 48h8"/></svg>',
'board':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="24" width="48" height="32" rx="2"/><path d="M16 24h48"/><path d="M28 56v6m24-6v6"/><path d="M24 62h32"/></svg>',
'glue':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 18h16v12l4 4v24H28V34l4-4V18z"/><path d="M32 30h16"/><path d="M36 58v6m8-6v6"/><circle cx="40" cy="46" r="3"/></svg>',
'tubing':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 28c0 0 0 24 20 24s20-24 20-24"/><path d="M20 28h8m24 0h8"/><path d="M28 52v10m24-10v10"/><circle cx="28" cy="28" r="3"/><circle cx="52" cy="28" r="3"/></svg>',
'frag':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="52" r="12"/><path d="M40 40v-8"/><path d="M34 28c2-4 4-6 6-10 2 4 4 6 6 10"/><path d="M32 30h16"/><path d="M36 52h8m-4-4v8"/></svg>',
'filterbag':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M26 20h28v4l-4 4v28c0 4-4 8-10 8s-10-4-10-8V28l-4-4v-4z"/><path d="M26 24h28"/><path d="M32 36h16m-16 8h16"/></svg>',
'filtercotton':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="28" width="44" height="24" rx="4"/><path d="M18 36h44m-44 8h44"/><path d="M26 24v4m14-4v4m14-4v4"/><path d="M26 52v4m14-4v4m14-4v4"/></svg>',
'filtercloth':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 24h40v8c-6 4-14 4-20 0s-14-4-20 0v-8z"/><path d="M20 40h40v8c-6 4-14 4-20 0s-14-4-20 0"/><path d="M20 56c6-4 14-4 20 0s14 4 20 0"/></svg>'};
const P_ICON_MAP={livestock:{'小丑鱼':'clownfish','吊类':'tang','龙/隆头鱼':'wrasse','虾虎鱼':'goby','神仙鱼':'angelfish','䲁鱼':'blenny','拟雀鲷':'dottyback','天竺鲷':'cardinal','鹰鱼':'hawkfish','其他鱼':'other_fish','星花/千手':'sps','LPS珊瑚':'lps','软体珊瑚':'soft','菇类':'mushroom','纽扣':'zoa','海葵':'anemone','火柴珊瑚':'gorgonian','脑珊瑚':'brain','榔头/茉莉':'torch','盘类':'plate','其他珊瑚':'other_coral','草皮':'carpet','花花/千手':'goniopora','螺':'snail','虾':'shrimp','蟹':'crab','海胆':'urchin','海星':'starfish','贝/砗磲':'clam','海参':'cucumber','其他无脊椎':'other_invert','藻':'algae','其他':'other_live'},equipment:{'水泵':'pump','灯':'light','造浪':'wave','蛋分':'skimmer','加热棒':'heater','冷水机':'chiller','温度计':'thermo','滴定':'doser','钙反':'reactor','煮豆机':'beansoup','补水器':'ato','杀菌灯':'uv','滤布机':'roller','喂食器':'feeder','检测设备':'tester','插座':'socket','串联缸':'sertank','珊瑚支架':'coralrack','工具':'tool','增氧设备':'airpump','造景':'scape','柜子':'cabinet','盐度计':'salinity','其他':'other_eq'},consumable:{'盐':'salt','食物':'food','添加剂':'additive','试剂':'reagent','药品':'medicine','吸附剂':'adsorbent','滤材':'media','包装':'package','板材':'board','胶水':'glue','水管':'tubing','珊瑚基座':'frag','滤袋':'filterbag','滤棉':'filtercotton','滤布':'filtercloth','其他':'other_cm'}};
const P_ICON_NAMES={clownfish:'小丑鱼',tang:'吊类',wrasse:'龙/隆头鱼',goby:'虾虎鱼',angelfish:'神仙鱼',blenny:'䲁鱼',dottyback:'拟雀鲷',cardinal:'天竺鲷',hawkfish:'鹰鱼',other_fish:'其他鱼',sps:'星花/千手',lps:'LPS珊瑚',soft:'软体珊瑚',mushroom:'菇类',zoa:'纽扣',anemone:'海葵',gorgonian:'火柴珊瑚',brain:'脑珊瑚',torch:'榔头/茉莉',plate:'盘类',other_coral:'其他珊瑚',carpet:'草皮',goniopora:'花花/千手',snail:'螺',shrimp:'虾',crab:'蟹',urchin:'海胆',starfish:'海星',clam:'贝/砗磲',cucumber:'海参',other_invert:'其他无脊椎',algae:'藻',other_live:'其他',pump:'水泵',light:'灯',wave:'造浪',skimmer:'蛋分',heater:'加热棒',chiller:'冷水机',thermo:'温度计',doser:'滴定泵',reactor:'钙反',beansoup:'煮豆机',ato:'补水器',uv:'杀菌灯',roller:'滤布机',feeder:'喂食器',tester:'检测',socket:'智能插座',other_eq:'其他',sertank:'串联缸',coralrack:'珊瑚支架',tool:'工具',airpump:'增氧设备',scape:'造景',cabinet:'柜子',salinity:'盐度计',salt:'海盐',food:'鱼粮',additive:'添加剂',reagent:'试剂',medicine:'药品',other_cm:'其他',adsorbent:'吸附剂',media:'滤材',package:'包装',board:'板材',glue:'胶水',tubing:'水管',frag:'珊瑚基座',filterbag:'滤袋',filtercotton:'滤棉',filtercloth:'滤布'};
function P_getIcon(type,cat){const key=P_ICON_MAP[type]&&P_ICON_MAP[type][cat];return key&&P_ICONS[key]?P_ICONS[key]:'';}

// Default icons per category
const P_DEF_ICONS={
  '鱼':'🐠','珊瑚':'🪸','无脊椎':'🦐','藻':'🌿','其他':'🔵',
  '水泵':'💧','灯':'💡','造浪':'🌊','蛋分':'🫧','加热棒':'🌡️','冷水机':'❄️',
  '温度计':'🌡️','滴定':'🧪','钙反':'⚗️','煮豆机':'♨️','补水器':'🚰',
  '杀菌灯':'🔦','滤布机':'🧻','喂食器':'🍽️','检测设备':'📊','插座':'🔌',
  '盐':'🧂','食物':'🐟','添加剂':'💊','试剂':'🧪','药品':'💉',
};


/* Sort items by addDate ascending (oldest first) */
function _parseDate(s){
  if(!s)return Infinity;
  const p=String(s).split(/[-/.]/).map(Number);
  if(p.length<3||isNaN(p[0]))return Infinity;
  return p[0]*10000+p[1]*100+p[2];
}
function _getItemDate(item){
  return item.addDate||item.date||item.purchaseDate||item.buyDate||'';
}
function _sortByDate(items){
  return items.slice().sort((a,b)=>{const d=_parseDate(_getItemDate(a))-_parseDate(_getItemDate(b));return d!==0?d:(a.name||'').localeCompare(b.name||'','zh');});
}
function P_loadInv(){
  const s=_g(P_INV_KEY());
  let inv={livestock:[],equipment:[],consumables:[]};
  if(s){try{inv=JSON.parse(s);}catch(e){}}
  // Sort all arrays by addDate ascending (in place)
  if(inv.livestock) inv.livestock.sort((a,b)=>{const d=_parseDate(_getItemDate(a))-_parseDate(_getItemDate(b));return d!==0?d:(a.name||'').localeCompare(b.name||'','zh');});
  if(inv.equipment) inv.equipment.sort((a,b)=>{const d=_parseDate(_getItemDate(a))-_parseDate(_getItemDate(b));return d!==0?d:(a.name||'').localeCompare(b.name||'','zh');});
  if(inv.consumables) inv.consumables.sort((a,b)=>{const d=_parseDate(_getItemDate(a))-_parseDate(_getItemDate(b));return d!==0?d:(a.name||'').localeCompare(b.name||'','zh');});
  return inv;
}
function P_saveInv(inv){
  _s(P_INV_KEY(),JSON.stringify(inv));
}

function renderProfile(){
  const t=TK_current();
  // Header
  const hdr=document.getElementById('profileHeader');
  const daysSince=t.startDate?Math.floor((Date.now()-new Date(t.startDate+'T00:00:00').getTime())/(86400000)):-1;
  hdr.innerHTML='<div class="profile-avatar">🐠</div><div class="profile-info"><h2>'+t.name+'</h2><div class="meta">'+t.type+(daysSince>=0?' · 开缸 '+daysSince+' 天':'')+'</div></div><button class="profile-edit-btn" onclick="TF_open(&#39;'+t.id+'&#39;)">编辑</button>';
  // Grid
  const grid=document.getElementById('profileGrid');
  let gh='';
  gh+='<div class="profile-field"><div class="pf-label">类型</div><div class="pf-value">'+t.type+'</div></div>';
  gh+='<div class="profile-field"><div class="pf-label">水体</div><div class="pf-value accent">'+t.volume+' L</div></div>';
  if(t.startDate)gh+='<div class="profile-field"><div class="pf-label">开缸日期</div><div class="pf-value">'+t.startDate+'</div></div>';
  if(daysSince>=0)gh+='<div class="profile-field"><div class="pf-label">开缸天数</div><div class="pf-value accent">'+daysSince+' 天</div></div>';
  if(t.source)gh+='<div class="profile-field"><div class="pf-label">购入渠道</div><div class="pf-value">'+t.source+'</div></div>';
  if(t.price)gh+='<div class="profile-field"><div class="pf-label">价格</div><div class="pf-value">¥'+t.price+'</div></div>';
  if(t.notes)gh+='<div class="profile-field" style="grid-column:1/-1"><div class="pf-label">备注</div><div class="pf-value" style="font-size:13px;font-weight:400">'+t.notes+'</div></div>';
  grid.innerHTML=gh;
  // Inventory
  const inv=P_loadInv();
  P_renderInvSection('ls',inv.livestock||[],'livestock');
  P_renderInvSection('eq',inv.equipment||[],'equipment');
  P_renderInvSection('cm',inv.consumables||[],'consumable');
}


function P_renderStats(){
  const inv=JSON.parse(localStorage.getItem(P_INV_KEY())||'{}');
  const livestock=inv.livestock||[], equipment=inv.equipment||[], consumables=inv.consumables||[];
  
  const totalLive=livestock.length;
  const alive=livestock.filter(x=>x.status==='alive').length;
  const dead=livestock.filter(x=>x.status==='dead').length;
  const survivalRate=totalLive>0?Math.round(alive/totalLive*100):0;
  
  const totalEquip=equipment.length;
  const activeEquip=equipment.filter(x=>x.status==='active').length;
  
  let totalCost=0;
  livestock.forEach(x=>{if(x.price)totalCost+=parseFloat(x.price)||0;});
  equipment.forEach(x=>{if(x.price)totalCost+=parseFloat(x.price)||0;});
  consumables.forEach(x=>{if(x.price)totalCost+=parseFloat(x.price)||0;});
  
  let waterCount=0;
  try{const wd=JSON.parse(localStorage.getItem(W_SK())||'{}');waterCount=(wd.rows||[]).length;}catch(e){}
  
  const fmtCost=totalCost>=10000?(totalCost/10000).toFixed(1)+'万':totalCost.toFixed(0);
  
  const statsHtml='<div class="pf-stats">'+
    '<div class="pf-stat-card"><div class="pf-stat-val">'+alive+'<span class="pf-stat-unit">/'+totalLive+'</span></div><div class="pf-stat-lbl">生物存活</div>'+(totalLive>0?'<div class="pf-stat-rate'+(survivalRate<70?' low':'')+'">'+survivalRate+'%</div>':'')+'</div>'+
    '<div class="pf-stat-card"><div class="pf-stat-val">'+activeEquip+'<span class="pf-stat-unit">/'+totalEquip+'</span></div><div class="pf-stat-lbl">设备运行</div></div>'+
    '<div class="pf-stat-card"><div class="pf-stat-val">'+consumables.length+'</div><div class="pf-stat-lbl">耗材种类</div></div>'+
    '<div class="pf-stat-card"><div class="pf-stat-val">¥'+fmtCost+'</div><div class="pf-stat-lbl">累计投入</div></div>'+
    '<div class="pf-stat-card"><div class="pf-stat-val">'+waterCount+'</div><div class="pf-stat-lbl">水质记录</div></div>'+
  '</div>';
  
  const pfEl=document.getElementById('profilePage');
  if(!pfEl)return;
  const firstInvSec=pfEl.querySelector('.inv-section');
  if(firstInvSec){
    const d=document.createElement('div');d.innerHTML=statsHtml;
    pfEl.insertBefore(d.firstElementChild,firstInvSec);
  }
}

/* Check if a date string is overdue (past today) */

/* Check if a date string is overdue (past today) */
function _isOverdue(dateStr){
  if(!dateStr) return false;
  const today=new Date();
  today.setHours(0,0,0,0);
  const d=new Date(dateStr+'T00:00:00');
  return d<=today;
}
/* Calculate remaining days from today to a date string */
function _daysRemain(dateStr){
  if(!dateStr) return null;
  const today=new Date();
  today.setHours(0,0,0,0);
  const d=new Date(dateStr+'T00:00:00');
  return Math.ceil((d-today)/(86400000));
}

function _glowCSS(level,color){
  if(!level)return '';
  if(level===1) return ';filter:drop-shadow(0 0 2px '+color+') drop-shadow(0 0 5px '+color+'50)';
  if(level===2) return ';filter:drop-shadow(0 0 3px '+color+') drop-shadow(0 0 6px '+color+'90) brightness(1.1) saturate(1.2)';
  return ';filter:drop-shadow(0 0 3px '+color+') drop-shadow(0 0 7px '+color+'aa) drop-shadow(0 0 12px '+color+'40) brightness(1.2) saturate(1.4)';
}
function _renderCard(item,i,type,childCount){
  const _iconRaw=item.icon||'';
  const _iconParts=_iconRaw.split('|');
  const iconKey=_iconParts[0]||'';
  const iconColor=_iconParts[1]||'var(--accent)';
  const iconGlow=parseInt(_iconParts[2])||0;
  const hasSvg=iconKey&&P_ICONS[iconKey];
  const glowStyle=_glowCSS(iconGlow,iconColor);
  const iconHtml=hasSvg?'<div class="inv-card-icon'+(iconGlow>0?' glow-'+iconGlow:'')+'" style="color:'+iconColor+glowStyle+'">'+P_ICONS[iconKey]+'</div>':'<div class="inv-icon">📦</div>';
  const stClass=item.status?' st-'+item.status:'';
  let badge='';
  if(item.status==='dead') badge='<span class="inv-badge inv-badge-dead" title="死亡">💀</span>';
  else if(item.status==='sold') badge='<span class="inv-badge inv-badge-sold" title="售出">💸</span>';
  if(item.origin==='breed') badge+='<span class="inv-badge inv-badge-breed" title="繁殖">🌱</span>';
  if(childCount>0) badge+='<span class="inv-badge inv-badge-child" title="繁殖'+childCount+'个子体">🌱'+childCount+'</span>';
  let h='<div class="inv-card'+stClass+'" onclick="P_editItem(&#39;'+type+'&#39;,'+i+')">'+badge+iconHtml;
  if(type==='livestock'){
    h+='<div class="inv-name">'+item.name+'</div>';
    let sub=[];
    if(item.breed) sub.push(item.breed);
    if(item.size) sub.push(item.size);
    if(sub.length) h+='<div class="inv-sub">'+sub.join('·')+'</div>';
  }else if(type==='equipment'){
    h+='<div class="inv-name">'+item.name+'</div>';
    let sub=[];
    if(item.brand) sub.push(item.brand);
    if(item.spec) sub.push(item.spec);
    if(sub.length) h+='<div class="inv-sub">'+sub.join('·')+'</div>';
  }else if(type==='consumable'){
    h+='<div class="inv-name">'+item.name+'</div>';
    let sub=[];
    if(item.spec) sub.push(item.spec);
    if(item.replaceDate){
      const days=_daysRemain(item.replaceDate);
      if(days!==null){
        if(days<=0) sub.push('<span class="inv-overdue">已到期</span>');
        else sub.push('剩余'+days+'天');
      }
    }
    if(sub.length) h+='<div class="inv-sub">'+sub.join('·')+'</div>';
  }
  h+='</div>';
  return h;
}

const _INACTIVE_ST=['sold','dead','empty','expired','broken'];
const _filterState={livestock:'all',equipment:'all',consumable:'all'};
function P_filter(btn){
  const bar=btn.parentElement;
  const type=bar.dataset.type;
  const f=btn.dataset.f;
  _filterState[type]=f;
  bar.querySelectorAll('.inv-ft').forEach(b=>b.classList.toggle('active',b===btn));
  renderProfile();
}
function P_renderInvSection(prefix,items,type){
  const countEl=document.getElementById(prefix+'Count');
  const gridEl=document.getElementById(prefix+'Grid');
  const filter=_filterState[type]||'all';
  // Build child count map (parentId -> count)
  const childMap={};
  if(type==='livestock'){
    items.forEach((item)=>{
      if(item.origin==='breed'&&item.parentId){
        childMap[item.parentId]=(childMap[item.parentId]||0)+1;
      }
    });
  }
  // Exclude breed children from main grid
  const mainItems=[];
  items.forEach((item,i)=>{
    if(type==='livestock'&&item.origin==='breed') return;
    mainItems.push({item,i});
  });
  const active=[], inactive=[];
  mainItems.forEach(({item,i})=>{
    if(_INACTIVE_ST.includes(item.status)) inactive.push({item,i});
    else active.push({item,i});
  });
  countEl.textContent=items.length?active.length+'/'+items.length:'';
  const typeName=IF_TITLES[type]||'';
  let filtered=[];
  if(filter==='all') filtered=mainItems;
  else if(filter==='active') filtered=active;
  else filtered=mainItems.filter(({item})=>item.status===filter);
  let h='<div class="inv-grid">';
  filtered.forEach(({item,i})=>{ h+=_renderCard(item,i,type,childMap[i.toString()]||0); });
  h+='<div class="inv-card inv-card-add" onclick="P_openForm(&#39;'+type+'&#39;)"><span class="inv-add-plus">+</span><span class="inv-add-label">添加'+typeName+'</span></div>';
  h+='</div>';
  gridEl.innerHTML=h;
}

// --- Item Form ---
let _ifType='',_ifIdx=-1;
const IF_FIELDS={
  livestock:[
    {key:'name',label:'名称',type:'text',required:true,top:true},
    {key:'breed',label:'品种',type:'text',top:true},
    {key:'size',label:'尺寸',type:'text',placeholder:'如 5cm',top:true},
    {key:'icon',label:'图标',type:'icon_picker'},
    {key:'addDate',label:'购入日期',type:'date'},
    {key:'source',label:'购入渠道',type:'text'},
    {key:'price',label:'价格',type:'number',placeholder:'¥'},
    {key:'status',label:'状态',type:'select',opts:['alive','dead','sold'],labels:['存活','死亡','售出'],required:true,default:'alive'},
    {key:'parentId',label:'',type:'hidden'},
    {key:'value',label:'价值',type:'number',placeholder:'¥',showWhen:{status:'alive'}},
    {key:'deathDate',label:'死亡时间',type:'date',showWhen:{status:'dead'}},
    {key:'sellDate',label:'售出时间',type:'date',showWhen:{status:'sold'}},
    {key:'sellPrice',label:'售出价格',type:'number',placeholder:'¥',showWhen:{status:'sold'}},
    {key:'notes',label:'备注',type:'textarea'},
  ],
  equipment:[
    {key:'name',label:'名称',type:'text',required:true,top:true},
    {key:'brand',label:'品牌',type:'text',top:true},
    {key:'spec',label:'规格',type:'text',top:true},
    {key:'icon',label:'图标',type:'icon_picker'},
    {key:'addDate',label:'购入日期',type:'date'},
    {key:'source',label:'购入渠道',type:'text'},
    {key:'price',label:'价格',type:'number',placeholder:'¥'},
    {key:'status',label:'状态',type:'select',opts:['active','broken','sold'],labels:['使用中','损坏','售出'],required:true,default:'active'},
    {key:'brokenDate',label:'损坏时间',type:'date',showWhen:{status:'broken'}},
    {key:'sellDate',label:'售出时间',type:'date',showWhen:{status:'sold'}},
    {key:'sellPrice',label:'售出价格',type:'number',placeholder:'¥',showWhen:{status:'sold'}},
    {key:'notes',label:'备注',type:'textarea'},
  ],
  consumable:[
    {key:'name',label:'名称',type:'text',required:true,top:true},
    {key:'brand',label:'品牌',type:'text',top:true},
    {key:'spec',label:'规格',type:'text',placeholder:'如 22kg',top:true},
    {key:'icon',label:'图标',type:'icon_picker'},
    {key:'addDate',label:'购入日期',type:'date'},
    {key:'source',label:'购入渠道',type:'text'},
    {key:'price',label:'价格',type:'number',placeholder:'¥'},
    {key:'status',label:'状态',type:'select',opts:['sealed','inuse','empty','sold','expired'],labels:['未开封','使用中','已用完','已售出','已过期'],required:true,default:'sealed'},
    {key:'replaceDate',label:'建议更换',type:'date',showWhen:{status:'inuse'}},
    {key:'emptyDate',label:'用完时间',type:'date',showWhen:{status:'empty'}},
    {key:'sellDate',label:'售出时间',type:'date',showWhen:{status:'sold'}},
    {key:'sellPrice',label:'售出价格',type:'number',placeholder:'¥',showWhen:{status:'sold'}},
    {key:'expireDate',label:'过期时间',type:'date',showWhen:{status:'expired'}},
    {key:'notes',label:'备注',type:'textarea'},
  ]
};
const IF_TITLES={livestock:'生物',equipment:'设备',consumable:'耗材'};

const IF_INV_KEYS={livestock:'livestock',equipment:'equipment',consumable:'consumables'};

function _ifRenderField(f,val){
  val=val!=null?val:(f.default||'');
  if(f.type==='icon_picker'){
    const iconSvg=val&&P_ICONS[val.split('|')[0]]?P_ICONS[val.split('|')[0]]:'';
    const iconColor=val&&val.includes('|')?val.split('|')[1]:'#4a90d9';
    const preview=iconSvg?'<span class="ip-preview" style="color:'+iconColor+'">'+iconSvg+'</span>':'<span class="ip-placeholder">选择图标</span>';
    return '<div class="ip-trigger" id="if_icon" data-val="'+(val||'')+'" onclick="IP_open()">'+preview+'<span class="ip-arrow">›</span></div>';
  }
  if(f.type==='select'&&f.opts&&f.opts.length<=5){
    const tags=f.opts.map((o,i)=>{
      const optVal=f.labels?f.opts[i]:o;
      const txt=f.labels?f.labels[i]:o;
      const active=(val===optVal)?' active':'';
      return '<span class="if-tag'+active+'" data-val="'+optVal+'" onclick="IF_pickTag(this)">'+txt+'</span>';
    }).join('');
    return '<div class="if-tags" id="if_'+f.key+'">'+tags+'</div>';
  }else if(f.type==='select'){
    const opts=f.opts.map((o,i)=>{
      const optVal=f.labels?f.opts[i]:o;
      const txt=f.labels?f.labels[i]:o;
      const sel=(val===optVal)?' selected':'';
      return '<option value="'+optVal+'"'+sel+'>'+txt+'</option>';
    }).join('');
    return '<select id="if_'+f.key+'">'+opts+'</select>';
  }else if(f.type==='date'){
    return '<input type="text" id="if_'+f.key+'" value="'+val+'" placeholder="YYYY-MM-DD" maxlength="10" oninput="IF_fmtDate(this)">';
  }else if(f.type==='textarea'){
    return '<textarea id="if_'+f.key+'" rows="2" placeholder="'+(f.placeholder||'')+'">'+val+'</textarea>';
  }else{
    return '<input type="'+(f.type||'text')+'" id="if_'+f.key+'" value="'+val+'" placeholder="'+(f.placeholder||'')+'">';
  }
}
/* Auto-format date: insert dashes as user types */
function IF_fmtDate(el){
  let v=el.value.replace(/[^0-9]/g,'');
  if(v.length>4) v=v.slice(0,4)+'-'+v.slice(4);
  if(v.length>7) v=v.slice(0,7)+'-'+v.slice(7);
  if(v.length>10) v=v.slice(0,10);
  el.value=v;
}
let _ifHiddenVals={};
function _ifRenderAll(type,vals){
  _ifHiddenVals={};
  IF_FIELDS[type].forEach(f=>{if(f.type==="hidden")_ifHiddenVals[f.key]=vals[f.key]||"";});
  const topBox=document.getElementById('ifTopFields');
  const box=document.getElementById('ifFields');
  const status=vals.status||(IF_FIELDS[type].find(f=>f.key==='status')||{}).default||'';
  const fields=IF_FIELDS[type];
  let topH='',restH='';
  fields.forEach(f=>{
    if(f.type==='icon_picker'||f.type==='hidden') return;
    if(f.showWhen){
      const k=Object.keys(f.showWhen)[0];
      const need=f.showWhen[k];
      const cur=vals[k]||status;
      if(cur!==need) return;
    }
    const v=vals[f.key]!=null?vals[f.key]:'';
    const inp=_ifRenderField(f,v);
    const row='<div class="if-row" data-fk="'+f.key+'"><label'+(f.required?' class="req"':'')+'>'+ f.label+'</label>'+inp+'</div>';
    if(f.top) topH+=row;
    else restH+=row;
  });
  topBox.innerHTML=topH;
  box.innerHTML=restH;
}
/* === Icon Picker Modal === */
let _ipIcon='',_ipColor='#4a90d9',_ipGlow=0;
function IP_open(){
  const trigger=document.getElementById('if_icon');
  const disp=document.getElementById('ifIconDisplay');
  const curVal=trigger?trigger.dataset.val:(disp?disp.dataset.val:'');
  if(curVal&&curVal.includes('|')){const pp=curVal.split('|');_ipIcon=pp[0];_ipColor=pp[1];_ipGlow=parseInt(pp[2])||0;}
  else if(curVal){_ipIcon=curVal;_ipColor='#4a90d9';_ipGlow=0;}
  else{_ipIcon='';_ipColor='#4a90d9';_ipGlow=0;}
  IP_render();
  const ov=document.getElementById('iconPickerOverlay');
  ov.style.display='flex';requestAnimationFrame(()=>ov.classList.add('open'));
}
function IP_close(){
  const ov=document.getElementById('iconPickerOverlay');ov.classList.remove('open');
  setTimeout(()=>ov.style.display='none',300);
}
function IP_render(){
  const box=document.getElementById('ipGrid');
  const typeMap={livestock:'livestock',equipment:'equipment',consumable:'consumable'};
  const currentType=typeMap[_ifType]||'equipment';
  const groups=[
    {type:'equipment',label:'设备',keys:Object.values(P_ICON_MAP.equipment||{})},
    {type:'livestock',label:'生物',keys:Object.values(P_ICON_MAP.livestock||{})},
    {type:'consumable',label:'耗材',keys:Object.values(P_ICON_MAP.consumable||{})},
  ];
  let h='';
  const group=groups.find(g=>g.type===currentType);
  if(group){
    h+='<div class="ip-group">';
    group.keys.forEach(k=>{
      if(!P_ICONS[k])return;
      const active=(k===_ipIcon)?' active':'';
      const name=P_ICON_NAMES[k]||k;
      h+='<div class="ip-opt'+active+'" data-k="'+k+'" onclick="IP_select(this)" title="'+name+'">'+P_ICONS[k]+'<span class="ip-opt-name">'+name+'</span></div>';
    });
    h+='</div>';
  }
  box.innerHTML=h;
  IP_renderColors();
  IP_updatePreview();
}
const IP_PALETTE=['#e74c3c','#e67e22','#f1c40f','#2ecc71','#00b894','#1abc9c','#0984e3','#00cec9','#3498db','#6c5ce7','#9b59b6','#e91e63','#fd79a8','#795548','#607d8b','#2c3e50','#b0bec5','#cfd8dc','#ffb74d','#aed581'];
function IP_renderColors(){
  const grid=document.getElementById('ipColorGrid');
  grid.innerHTML=IP_PALETTE.map(c=>{
    const active=(c===_ipColor)?' active':'';
    return '<div class="ip-color-dot'+active+'" style="background:'+c+'" data-c="'+c+'" onclick="IP_pickColor(this)"></div>';
  }).join('');
  const hexIn=document.getElementById('ipHexInput');
  const hexPv=document.getElementById('ipHexPreview');
  if(hexIn) hexIn.value=_ipColor;
  if(hexPv) hexPv.style.background=_ipColor;
  document.querySelectorAll('.ip-glow-btn').forEach(b=>b.classList.toggle('active',parseInt(b.dataset.g)===_ipGlow));
  const labels=['关','弱','中','强'];
  const valEl=document.getElementById('ipGlowVal');
  if(valEl) valEl.textContent=labels[_ipGlow]||'关';
}
function IP_pickColor(el){
  _ipColor=el.dataset.c;
  document.querySelectorAll('.ip-color-dot.active').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('ipHexInput').value=_ipColor;
  document.getElementById('ipHexPreview').style.background=_ipColor;
  IP_updatePreview();
}
function IP_onHex(v){
  v=v.trim();
  if(/^#[0-9a-fA-F]{6}$/.test(v)){
    _ipColor=v;
    document.getElementById('ipHexPreview').style.background=v;
    document.querySelectorAll('.ip-color-dot.active').forEach(e=>e.classList.remove('active'));
    IP_updatePreview();
  }
}
function IP_setGlow(g){
  _ipGlow=g;
  document.querySelectorAll('.ip-glow-btn').forEach(b=>b.classList.toggle('active',parseInt(b.dataset.g)===g));
  const labels=['关','弱','中','强'];
  const valEl=document.getElementById('ipGlowVal');
  if(valEl) valEl.textContent=labels[g]||'关';
  IP_updatePreview();
}
function IP_select(el){
  document.querySelectorAll('.ip-opt.active').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');
  _ipIcon=el.dataset.k;
  IP_updatePreview();
}
function IP_updatePreview(){
  const pv=document.getElementById('ipPreview');
  if(_ipIcon&&P_ICONS[_ipIcon]){
    const gf=_glowCSS(_ipGlow,_ipColor);
    pv.innerHTML='<span style="color:'+_ipColor+gf+'">'+P_ICONS[_ipIcon]+'</span>';
  }else{
    pv.innerHTML='<span class="ip-no">未选择</span>';
  }
}
function IP_confirm(){
  const val=_ipIcon?_ipIcon+'|'+_ipColor+(_ipGlow>0?'|'+_ipGlow:''):'';
  const trigger=document.getElementById('if_icon');
  if(trigger) trigger.dataset.val=val;
  const disp=document.getElementById('ifIconDisplay');
  if(disp) disp.dataset.val=val;
  if(disp){
    if(_ipIcon&&P_ICONS[_ipIcon]){
      const gf2=_glowCSS(_ipGlow,_ipColor);
      disp.innerHTML='<span style="color:'+_ipColor+gf2+'">'+P_ICONS[_ipIcon]+'</span>';
    }else{
      disp.innerHTML='<span class="if-icon-plus">+</span><span class="if-icon-hint">图标</span>';
    }
  }
  IP_close();
}

function _syncIconDisplay(val){
  const disp=document.getElementById('ifIconDisplay');
  if(!disp)return;
  disp.dataset.val=val||'';
  if(val&&val.includes('|')){
    const pp=val.split('|'),k=pp[0],c=pp[1],g=parseInt(pp[2])||0;
    const gf=_glowCSS(g,c);
    if(P_ICONS[k]) disp.innerHTML='<span style="color:'+c+gf+'">'+P_ICONS[k]+'</span>';
    else disp.innerHTML='<span class="if-icon-plus">+</span><span class="if-icon-hint">图标</span>';
  }else{
    disp.innerHTML='<span class="if-icon-plus">+</span><span class="if-icon-hint">图标</span>';
  }
}
function IF_pickTag(el){
  el.parentElement.querySelectorAll('.if-tag').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  const wrap=el.parentElement;
  if(wrap.id==='if_status'){
    const vals=IF_collectVals();
    vals.status=el.dataset.val;
    _ifRenderAll(_ifType,vals);
  }
}
function IF_collectVals(){
  const vals=Object.assign({},_ifHiddenVals);
  IF_FIELDS[_ifType].forEach(f=>{
    if(f.type==='icon_picker'){
      const disp=document.getElementById('ifIconDisplay');
      vals[f.key]=(disp&&disp.dataset.val)||'';
      return;
    }
    const el=document.getElementById('if_'+f.key);
    if(!el)return;
    if(f.type==='select'&&f.opts&&f.opts.length<=5){
      const active=el.querySelector('.if-tag.active');
      vals[f.key]=active?active.dataset.val:'';
    }else{
      vals[f.key]=el.value;
    }
  });
  return vals;
}
function P_openForm(type){
  _ifType=type;_ifIdx=-1;
  document.getElementById('ifTitle').textContent='添加'+IF_TITLES[type];
  document.getElementById('ifDelBtn').style.display='none';
  const breedBtn=document.getElementById('ifBreedBtn');
  if(breedBtn) breedBtn.style.display='none';
  const childBox=document.getElementById('ifChildrenBox');
  if(childBox){childBox.innerHTML='';childBox.style.display='none';}
  _ifRenderAll(type,{});
  _syncIconDisplay('');
  const ov=document.getElementById('itemFormOverlay');
  ov.style.display='flex';requestAnimationFrame(()=>ov.classList.add('open'));
}

function P_editItem(type,idx){
  _ifType=type;_ifIdx=idx;
  const inv=P_loadInv();
  const arr=inv[IF_INV_KEYS[type]]||[];
  const item=arr[idx];if(!item)return;
  document.getElementById('ifTitle').textContent='编辑'+IF_TITLES[type];
  document.getElementById('ifDelBtn').style.display='';
  const breedBtn=document.getElementById('ifBreedBtn');
  if(breedBtn) breedBtn.style.display=(type==='livestock'&&item.status==='alive'&&item.origin!=='breed')?'':'none';
  _ifRenderAll(type,item);
  _syncIconDisplay(item.icon||'');
  if(type==='livestock'&&item.origin!=='breed') _renderChildrenPanel(idx);
  else{const cb=document.getElementById('ifChildrenBox');if(cb){cb.innerHTML='';cb.style.display='none';}}
  const ov=document.getElementById('itemFormOverlay');
  ov.style.display='flex';requestAnimationFrame(()=>ov.classList.add('open'));
}

function IF_close(){
  const ov=document.getElementById('itemFormOverlay');ov.classList.remove('open');setTimeout(()=>{ov.style.display='none';},300);
}

function IF_save(){
  const flds=IF_FIELDS[_ifType];
  const _vals=IF_collectVals();
  const item={};
  for(const f of flds){
    let v=(_vals[f.key]||'').toString().trim();
    if(f.required&&!v){toast('请填写'+f.label);return;}
    if(f.type==='number'&&v)v=parseFloat(v);
    item[f.key]=v||'';
  }
  const inv=P_loadInv();
  const arrKey=IF_INV_KEYS[_ifType];
  if(!inv[arrKey])inv[arrKey]=[];
  if(_ifIdx>=0){
    // Preserve internal fields not in form
    const prev=inv[arrKey][_ifIdx]||{};
    if(prev.origin) item.origin=prev.origin;
    if(prev.parentId) item.parentId=prev.parentId;
    inv[arrKey][_ifIdx]=item;
  }else{inv[arrKey].push(item);}
  P_saveInv(inv);
  IF_close();
  renderProfile();
  toast('已保存');
}

function IF_del(){
  if(!confirm('确定删除？'))return;
  const inv=P_loadInv();
  const arrKey=IF_INV_KEYS[_ifType];
  if(!inv[arrKey])return;
  // If deleting a livestock parent, also remove its children
  if(_ifType==='livestock'){
    const pidStr=_ifIdx.toString();
    inv[arrKey]=inv[arrKey].filter((item,i)=>{
      if(i===_ifIdx) return false;
      if(item.origin==='breed'&&item.parentId===pidStr) return false;
      return true;
    });
    // Reindex parentId for remaining items
    inv[arrKey].forEach(item=>{
      if(item.parentId){
        const pid=parseInt(item.parentId);
        if(pid>_ifIdx) item.parentId=(pid-1).toString();
      }
    });
  }else{
    inv[arrKey].splice(_ifIdx,1);
  }
  P_saveInv(inv);
  IF_close();
  renderProfile();
  toast('已删除');
}


function P_breedItem(){
  const inv=P_loadInv();
  const arr=inv.livestock||[];
  const parent=arr[_ifIdx];
  if(!parent){toast('未找到母体');return;}
  const child={
    name:parent.name,
    breed:parent.breed||'',
    size:'',
    addDate:new Date().toISOString().slice(0,10),
    source:'',price:0,
    status:'alive',
    origin:'breed',
    parentId:_ifIdx.toString(),
    notes:''
  };
  arr.push(child);
  P_saveInv(inv);
  _renderChildrenPanel(_ifIdx);
  toast('已添加子体');
}
function _renderChildrenPanel(parentIdx){
  const box=document.getElementById('ifChildrenBox');
  if(!box) return;
  const inv=P_loadInv();
  const arr=inv.livestock||[];
  const children=[];
  arr.forEach((item,i)=>{
    if(item.origin==='breed'&&item.parentId===parentIdx.toString()) children.push({item,i});
  });
  if(!children.length){box.innerHTML='';box.style.display='none';return;}
  box.style.display='';
  const stClass={dead:'st-dead',sold:'st-sold'};
  let h='<div class="if-children-title">\u{1f331} \u5b50\u4f53 ('+children.length+')</div><div class="if-children-grid">';
  const _parentIcon=(arr[parentIdx]||{}).icon||'';
  children.forEach(({item,i})=>{
    const _iconRaw=_parentIcon;
    const _iconParts=_iconRaw.split('|');
    const iconKey=_iconParts[0]||'';
    const iconColor=_iconParts[1]||'var(--accent)';
    const iconGlow=parseInt(_iconParts[2])||0;
    const hasSvg=iconKey&&P_ICONS[iconKey];
    const glowStyle=_glowCSS(iconGlow,iconColor);
    const iconHtml=hasSvg?'<div class="inv-card-icon'+(iconGlow>0?' glow-'+iconGlow:'')+'" style="color:'+iconColor+glowStyle+'">'+P_ICONS[iconKey]+'</div>':'<div class="inv-icon">\u{1f331}</div>';
    const sc=stClass[item.status]||'';
    let badge='';
    if(item.status==='dead') badge='<span class="inv-badge inv-badge-dead">\u{1f480}</span>';
    else if(item.status==='sold') badge='<span class="inv-badge inv-badge-sold">\u{1f4b8}</span>';
    h+='<div class="inv-card inv-card-child '+sc+'" onclick="P_editChild('+i+')">'+badge+iconHtml;
    h+='<div class="inv-name">'+(item.name||'\u5b50\u4f53')+'</div>';
    let sub=[];
    if(item.size) sub.push(item.size);
    if(item.sellPrice) sub.push('\u00a5'+item.sellPrice);
    if(sub.length) h+='<div class="inv-sub">'+sub.join('\u00b7')+'</div>';
    h+='</div>';
  });
  h+='</div>';
  box.innerHTML=h;
}
let _ceIdx=-1;
function P_editChild(idx){
  const inv=P_loadInv();
  const arr=inv.livestock||[];
  const child=arr[idx];
  if(!child) return;
  _ceIdx=idx;
  const ov=document.getElementById('childFormOverlay');
  document.getElementById('ceTitle').textContent='\u7f16\u8f91\u5b50\u4f53';
  let fh='';
  fh+='<div class="if-row"><label>\u72b6\u6001</label><div class="if-tags" id="ce_status">';
  [{v:'alive',l:'\u5b58\u6d3b'},{v:'dead',l:'\u6b7b\u4ea1'},{v:'sold',l:'\u552e\u51fa'},{v:'moved',l:'\u8f6c\u7f38'}].forEach(s=>{
    fh+='<span class="if-tag'+(child.status===s.v?' active':'')+'" data-val="'+s.v+'" onclick="IF_pickTag(this)">'+s.l+'</span>';
  });
  fh+='</div></div>';
  fh+='<div class="if-row"><label>\u5c3a\u5bf8</label><input id="ce_size" value="'+(child.size||'')+'" placeholder="\u5982 3cm"></div>';
  fh+='<div class="if-row"><label>\u552e\u51fa\u65e5\u671f</label><input type="text" id="ce_sellDate" value="'+(child.sellDate||'')+'" placeholder="YYYY-MM-DD" maxlength="10" oninput="IF_fmtDate(this)"></div>';
  fh+='<div class="if-row"><label>\u552e\u51fa\u4ef7\u683c</label><input id="ce_sellPrice" type="number" value="'+(child.sellPrice||'')+'" placeholder="\u00a5"></div>';
  fh+='<div class="if-row"><label>\u5907\u6ce8</label><input id="ce_notes" value="'+(child.notes||'')+'"></div>';
  document.getElementById('ceFields').innerHTML=fh;
  ov.style.display='flex';requestAnimationFrame(()=>ov.classList.add('open'));
}
function CE_close(){
  const ov=document.getElementById('childFormOverlay');ov.classList.remove('open');setTimeout(()=>{ov.style.display='none';},300);
}
function CE_save(){
  const inv=P_loadInv();
  const arr=inv.livestock||[];
  const child=arr[_ceIdx];
  if(!child) return;
  const stEl=document.getElementById('ce_status');
  const activeTag=stEl?stEl.querySelector('.if-tag.active'):null;
  if(activeTag) child.status=activeTag.dataset.val;
  child.size=(document.getElementById('ce_size').value||'').trim();
  child.sellDate=(document.getElementById('ce_sellDate').value||'').trim();
  child.sellPrice=(document.getElementById('ce_sellPrice').value||'').trim();
  child.notes=(document.getElementById('ce_notes').value||'').trim();
  P_saveInv(inv);
  CE_close();
  _renderChildrenPanel(_ifIdx);
  toast('\u5df2\u4fdd\u5b58');
}
function CE_del(){
  if(!confirm('\u5220\u9664\u6b64\u5b50\u4f53\uff1f')) return;
  P_delChild(_ceIdx);
  CE_close();
}
function P_delChild(idx){
  const inv=P_loadInv();
  const arr=inv.livestock||[];
  arr.splice(idx,1);
  if(idx<_ifIdx) _ifIdx--;
  arr.forEach(item=>{
    if(item.parentId){
      const pid=parseInt(item.parentId);
      if(pid>idx) item.parentId=(pid-1).toString();
      else if(pid===idx) item.parentId='';
    }
  });
  P_saveInv(inv);
  _renderChildrenPanel(_ifIdx);
  toast('\u5df2\u5220\u9664');
}
function initProfile(){
  // Profile page is render-only, no special init needed
}


// === Import Module ===
let _impType='';
let _impData=[];

function IMP_open(type){
  _impType=type;
  _impData=[];
  document.getElementById('impTitle').textContent='导入'+IF_TITLES[type];
  document.getElementById('impTextarea').value='';
  document.getElementById('impFileName').textContent='';
  document.getElementById('impPreview').innerHTML='';
  document.getElementById('impConfirmBtn').disabled=true;
  IMP_switchTab('paste');
  const ov=document.getElementById('impOverlay');
  ov.style.display='flex';requestAnimationFrame(()=>ov.classList.add('open'));
}

function IMP_close(){
  const ov=document.getElementById('impOverlay');ov.classList.remove('open');
  setTimeout(()=>ov.style.display='none',300);
}

function IMP_switchTab(tab){
  document.querySelectorAll('.imp-tab').forEach(t=>t.classList.remove('active'));
  if(tab==='paste'){
    document.querySelectorAll('.imp-tab')[0].classList.add('active');
    document.getElementById('impPasteArea').style.display='';
    document.getElementById('impFileArea').style.display='none';
  }else{
    document.querySelectorAll('.imp-tab')[1].classList.add('active');
    document.getElementById('impPasteArea').style.display='none';
    document.getElementById('impFileArea').style.display='';
  }
}

function IMP_onFile(e){
  const file=e.target.files[0];
  if(!file)return;
  document.getElementById('impFileName').textContent=file.name;
  const reader=new FileReader();
  reader.onload=function(ev){
    document.getElementById('impTextarea').value=ev.target.result;
  };
  reader.readAsText(file);
}

function IMP_parseCSV(text){
  text=text.replace(/^\uFEFF/,"");
  const lines=text.trim().split('\n').map(l=>l.trim()).filter(l=>l);
  if(lines.length<2) return [];
  const headers=lines[0].split(',').map(h=>h.trim().replace(/^"|"$/g,''));
  const rows=[];
  for(let i=1;i<lines.length;i++){
    const vals=lines[i].split(',').map(v=>v.trim().replace(/^"|"$/g,''));
    const obj={};
    headers.forEach((h,j)=>{obj[h]=vals[j]||'';});
    rows.push(obj);
  }
  return rows;
}

function IMP_preview(){
  const text=document.getElementById('impTextarea').value.trim();
  if(!text){toast('请输入数据');return;}
  let data=[];
  try{
    data=JSON.parse(text);
    if(!Array.isArray(data)){toast('JSON 必须是数组格式');return;}
  }catch(e){
    // Try CSV
    data=IMP_parseCSV(text);
    if(!data.length){toast('无法解析数据，请检查格式');return;}
  }
  if(!data.length){toast('没有解析到数据');return;}
  _impData=data;
  // Show preview
  let h='<div class="imp-preview-info">解析到 <b>'+data.length+'</b> 条记录</div>';
  h+='<div class="imp-preview-table"><table><tr>';
  const keys=Object.keys(data[0]);
  keys.forEach(k=>{h+='<th>'+k+'</th>';});
  h+='</tr>';
  const showCount=Math.min(data.length,5);
  for(let i=0;i<showCount;i++){
    h+='<tr>';
    keys.forEach(k=>{h+='<td>'+(data[i][k]||'')+'</td>';});
    h+='</tr>';
  }
  if(data.length>5) h+='<tr><td colspan="'+keys.length+'" style="text-align:center;color:var(--text4)">... 共 '+data.length+' 条</td></tr>';
  h+='</table></div>';
  document.getElementById('impPreview').innerHTML=h;
  document.getElementById('impConfirmBtn').disabled=false;
}

function IMP_confirm(){
  if(!_impData.length){toast('请先预览数据');return;}
  const inv=P_loadInv();
  const arrKey=IF_INV_KEYS[_impType];
  if(!inv[arrKey])inv[arrKey]=[];
  // Map fields and add defaults
  const fields=IF_FIELDS[_impType];
  const fieldKeys=fields.map(f=>f.key);
  _impData.forEach(row=>{
    const item={};
    fieldKeys.forEach(k=>{
      item[k]=row[k]||'';
    });
    // Ensure name exists
    if(!item.name&&row['名称']) item.name=row['名称'];
    if(!item.breed&&row['品种']) item.breed=row['品种'];
    if(!item.brand&&row['品牌']) item.brand=row['品牌'];
    if(!item.spec&&row['规格']) item.spec=row['规格'];
    if(!item.size&&row['尺寸']) item.size=row['尺寸'];
    if(!item.status){
      const defaults={livestock:'alive',equipment:'active',consumable:'sealed'};
      item.status=defaults[_impType]||'';
    }
    if(item.name) inv[arrKey].push(item);
  });
  P_saveInv(inv);
  IMP_close();
  renderProfile();
  toast('已导入 '+_impData.length+' 条记录');
  _impData=[];
}

function P_clearAll(type){
  const typeName=IF_TITLES[type]||'';
  const inv=P_loadInv();
  const arrKey=IF_INV_KEYS[type];
  const count=(inv[arrKey]||[]).length;
  if(!count){toast('没有数据可清空');return;}
  if(!confirm('确定清空全部 '+count+' 条'+typeName+'记录？此操作不可恢复！'))return;
  inv[arrKey]=[];
  P_saveInv(inv);
  renderProfile();
  toast('已清空'+typeName);
}
