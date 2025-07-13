# HA虚拟机 托管的I/O问题

## 解决方法
1. ssh 登入exsi机器
2. 先chceck后repair

```bash
vmkfstools -x check /vmfs/volumes/6539a555-33ecd498-e4fc-60beb40e9688/HomeAssistant/haos_ova-11.0.vmdk
vmkfstools -x repair /vmfs/volumes/6539a555-33ecd498-e4fc-60beb40e9688/HomeAssistant/haos_ova-11.0.vmdk
```
