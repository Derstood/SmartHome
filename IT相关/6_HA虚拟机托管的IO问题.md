# HA虚拟机 托管的I/O问题

## 解决方法
1. ssh 登入exsi机器
2. 先chceck后repair

```bash
vmkfstools -x check /vmfs/volumes/5fee7060-228842b9-f949-60beb414cab4/HomeAssistant/haos_ova-11.5-000005.vmdk
vmkfstools -x repair /vmfs/volumes/5fee7060-228842b9-f949-60beb414cab4/HomeAssistant/haos_ova-11.5-000005.vmdk
```