package io.activestack.helloworld.model;

import com.percero.framework.bl.IManifest;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SuppressWarnings("rawtypes")
@Component
public class HelloWorldManifest implements IManifest
{

    private List<Class> classList = null;
    public List<Class> getClassList() {
        if (classList == null) {
            classList = new ArrayList<Class>();
            // Register Classes here
             classList.add(User.class);
            classList.add(UserRole.class);
            classList.add(Email.class);
            classList.add(Block.class);
        }
        return classList;
    }

    private List<Object> objectList = null;
    public List<Object> getObjectList() {
        if (objectList == null) {
            objectList = new ArrayList<Object>();
            // Instantiate one of each model object
             objectList.add(new User());
            objectList.add(new UserRole());
            objectList.add(new Email());
            objectList.add(new Block());
        }
        return objectList;
    }

    private Map<String, Class> uuidMap = null;
    public Map<String, Class> getUuidMap() {
        if (uuidMap == null) {
            uuidMap = new HashMap<String, Class>();
            // Create UUID map for each model class
            uuidMap.put("1", User.class);
            uuidMap.put("2", UserRole.class);
            uuidMap.put("3", Email.class);
            uuidMap.put("4", Block.class);
        }
        return uuidMap;
    }
}

