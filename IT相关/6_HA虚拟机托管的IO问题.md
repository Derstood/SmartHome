# HA����� �йܵ�I/O����

## �������
1. ssh ����exsi����
2. ��chceck��repair

```bash
vmkfstools -x check /vmfs/volumes/5fee7060-228842b9-f949-60beb414cab4/HomeAssistant/haos_ova-11.5-000005.vmdk
vmkfstools -x repair /vmfs/volumes/5fee7060-228842b9-f949-60beb414cab4/HomeAssistant/haos_ova-11.5-000005.vmdk
```