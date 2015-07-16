package io.activestack.helloworld.auth.helpers;

import com.percero.agents.auth.helpers.AccountHelper;
import com.percero.framework.bl.ManifestHelper;
import io.activestack.helloworld.model.HelloWorldManifest;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;

@Component
public class HelloWorldAccountHelper extends AccountHelper {

	private static final Logger log = Logger.getLogger(HelloWorldAccountHelper.class);
	
	public static final String ROLE_ADMIN = "ADMIN";
	public static final String ROLE_BASIC = "BASIC";
	
	public HelloWorldAccountHelper() {
		super();
		manifest = new HelloWorldManifest();
		ManifestHelper.setManifest(manifest);
		
		log.debug("HelloWorldAccountHelper instantiated.");
	}
}
